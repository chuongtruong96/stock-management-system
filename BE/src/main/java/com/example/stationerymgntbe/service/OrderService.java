package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.enums.OrderStatus;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.*;
import com.example.stationerymgntbe.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    /* ===== DEPENDENCIES ===== */
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final EmailService mail;
    private final UserService userService;
    private final BroadcastService broadcast;
    private final OrderMapper orderMapper;
    private final OrderItemMapper itemMapper;
    private final ReportService reportService;
    private final FileStorageService storage;
    
    @Value("${upload.dir:uploads}")
    private String uploadDir; // ./uploads by default
    
    private boolean windowOpen = true;

    /* ------------------------------------------------- */
    public boolean toggleWindow() { windowOpen = !windowOpen; return windowOpen; }
    public boolean isWindowOpen() { return windowOpen; }
    /*
     * ─────────────────────────────
     * CREATE ORDER
     * ─────────────────────────────
     */
    @Transactional
    public OrderDTO createOrder(OrderInput input) {
        validateOrderWindow();

        User current = userService.getCurrentUserEntity();
        Department dept = Optional.ofNullable(current.getDepartment())
                                  .orElseThrow(() -> new IllegalStateException("User has no department"));

        Order order = new Order();
        order.setDepartment(dept);
        order.setStatus(OrderStatus.pending);
        order.setCreatedBy(current);
        order = orderRepo.save(order);

        for (OrderItemInput it : input.getItems()) {
            Product p = productRepo.findById(it.getProductId())
                                   .orElseThrow(() -> new ResourceNotFoundException("Product "+ it.getProductId()));

            OrderItem oi = OrderItem.builder()
                .order(order)
                .product(p)
                .quantity(it.getQuantity())
                .build();
            itemRepo.save(oi);
        }

        mail.sendOrderNotificationToAdmin(orderMapper.toOrderDTO(order));
        broadcast.orderStatusChanged(new OrderStatusDTO(order.getOrderId(),"pending",
                dept.getDepartmentId(), dept.getName()));

        return orderMapper.toOrderDTO(order);
    }

    /*
     * ─────────────────────────────
     * USER FLOW
     * ─────────────────────────────
     */

    /** pending → exported */
    @Transactional
    public OrderDTO exportOrder(Integer id) {
        Order o = require(id, OrderStatus.pending);
        o.setStatus(OrderStatus.exported);
        o.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(o);
        notifyAdminsOrderExported(o);
        return orderMapper.toOrderDTO(o);
    }

    /** exported → submitted + lưu PDF */
    @Transactional
    public OrderDTO markAsSubmitted(Integer id, MultipartFile file) throws IOException {
        Order o = require(id, OrderStatus.exported);

        if (!file.isEmpty()) {
            Path dir = Paths.get(uploadDir, "orders");
            Files.createDirectories(dir);
            Path path = dir.resolve(id + ".pdf");
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            o.setSignedPdfPath(path.toString());
        }

        o.setStatus(OrderStatus.submitted);
        o.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(o);
        notifyAdminsOrderSubmitted(o);
        return orderMapper.toOrderDTO(o);
    }

    /*
     * ─────────────────────────────
     * APPROVE ORDER
     * ─────────────────────────────
     */
    @Transactional
    public OrderDTO approveOrder(Integer id, String comment) {
        Order order = require(id, OrderStatus.submitted);

        order.setStatus(OrderStatus.approved);
        order.setUpdatedAt(LocalDateTime.now());
        order.setApprovedBy(userService.getCurrentUserEntity());
        order.setAdminComment(comment);
        orderRepo.save(order);

        mail.sendOrderApprovalNotification(order);
        broadcast.orderStatusChanged(statusDTO(order, "approved"));

        return orderMapper.toOrderDTO(order);
    }

    /*
     * ─────────────────────────────
     * REJECT ORDER
     * ─────────────────────────────
     */
    @Transactional
    public OrderDTO rejectOrder(Integer id, String comment) {
        Order order = require(id, OrderStatus.submitted);

        order.setStatus(OrderStatus.rejected);
        order.setUpdatedAt(LocalDateTime.now());
        order.setAdminComment(comment);
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepo.save(order);

        mail.sendOrderRejectionNotification(order, comment);
        broadcast.orderStatusChanged(statusDTO(order, "rejected"));

        return orderMapper.toOrderDTO(order);
    }

    /*
     * ─────────────────────────────
     * QUERY HELPERS
     * ─────────────────────────────
     */

    public List<OrderDTO> getAllOrders() {
        return orderRepo.findAll().stream()
                .map(orderMapper::toOrderDTO).toList();
    }

    public List<OrderDTO> getPendingOrders() {
        return map(orderRepo.findByStatus(OrderStatus.pending));
    }

    public List<OrderDTO> getSubmittedOrders() {
        return map(orderRepo.findByStatus(OrderStatus.submitted));
    }

    public List<OrderDTO> getOrdersByDepartment(int deptId) {
        return map(orderRepo.findByDepartment_DepartmentId(deptId));
    }

    public List<OrderItemDTO> getOrderItems(int orderId) {
        if (!orderRepo.existsById(orderId))
            throw new ResourceNotFoundException("Order " + orderId);
        return itemRepo.findByOrderOrderId(orderId).stream()
                .map(itemMapper::toOrderItemDTO).toList();
    }

    public int getPendingOrdersCount() {
        return (int) orderRepo.countByStatus(OrderStatus.pending);
    }

    public int getMonthlyOrdersCount(int year, int month) {
        var start = LocalDateTime.of(year, month, 1, 0, 0);
        return (int) orderRepo.countByCreatedAtBetween(start, start.plusMonths(1));
    }

    public OrderDTO getLatestOrder(int deptId) {
        return orderRepo.findTopByDepartmentDepartmentIdOrderByCreatedAtDesc(deptId)
                .map(orderMapper::toOrderDTO).orElse(null);
    }

    public List<OrderDTO> getOrdersByMonthAndYear(Integer month, Integer year) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return map(orderRepo.findByCreatedAtBetween(start, end));
    }

    public List<ProductOrderSummaryDTO> getTopOrderedProducts(int top) {
        return itemRepo.findTopProducts(PageRequest.of(0, top));
    }

    public Order findById(Integer id) {
        return orderRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order " + id));
    }

    private boolean isWithinFirstWeek() {
        return LocalDate.now().getDayOfMonth() <= 7;
    }
    
    public Map<String, Boolean> checkOrderPeriod() {
        boolean canOrder = windowOpen || isWithinFirstWeek();
        return Collections.singletonMap("canOrder", canOrder);
    }
    
    private void validateOrderWindow() {
        if (!windowOpen && !isWithinFirstWeek())
            throw new IllegalStateException("Ordering window is closed.");
    }

    private Order require(Integer id, OrderStatus expected) {
        Order o = orderRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + id));
        if (o.getStatus() != expected)
            throw new IllegalStateException("Required status: " + expected + "; current: " + o.getStatus());
        return o;
    }

    private void notifyAdminsOrderExported(Order o) {
        notifyAdmins(o, "New Order Exported", "has exported an order for signing.");
    }

    private void notifyAdminsOrderSubmitted(Order o) {
        notifyAdmins(o, "Signed Order Submitted", "has submitted the signed order.");
    }

    private void notifyAdmins(Order o, String title, String tail) {
        String msg = "Department " + o.getDepartment().getName() + " " + tail;
        userService.getAdminUsernames()
                .forEach(u -> notification.sendToUser(null, u, title, msg, "/admin/orders"));
    }

    private void notifyCreator(Order o, String title, String msg) {
        User cr = o.getCreatedBy();
        notification.sendToUser(cr.getUserId(), cr.getUsername(),
                "Order #" + o.getOrderId() + " " + title, msg, "/order-history");
    }

    private OrderStatusDTO statusDTO(Order o, String s) {
        Department d = o.getDepartment();
        return new OrderStatusDTO(o.getOrderId(), s, d.getDepartmentId(), d.getName());
    }

    private List<OrderDTO> map(List<Order> list) {
        return list.stream().map(orderMapper::toOrderDTO).toList();
    }

    public Page<OrderDTO> findByCreator(Integer uid, Pageable pg){
        return orderRepo.findByCreatedByUserIdOrderByCreatedAtDesc(uid,pg)
                        .map(orderMapper::toOrderDTO);
    }

    @Transactional
    public OrderDTO updateComment(Integer id, String comment) {
        Order order = orderRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + id));
        order.setAdminComment(comment);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(order);
        broadcast.orderStatusChanged(new OrderStatusDTO(
                id,
                order.getStatus().name().toLowerCase(),
                order.getDepartment().getDepartmentId(),
                order.getDepartment().getName()));
        return orderMapper.toOrderDTO(order);
    }

    public byte[] exportPdf(Integer id) throws IOException {
        Order o = require(id, OrderStatus.pending);
        // generate PDF bytes via ReportService (reuse)
        byte[] pdf = reportService.exportSingleOrder(o); // create helper
        storage.savePdf(id,pdf);
        o.setStatus(OrderStatus.exported);
        orderRepo.save(o);
        return pdf;
    }

    private final NotificationService notification;
}