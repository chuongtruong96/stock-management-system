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

    /* ========== DEPENDENCIES ========== */
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final UserService userService;
    private final EmailService mail;
    private final BroadcastService broadcast;
    private final NotificationService notification;
    private final OrderMapper orderMapper;
    private final OrderItemMapper itemMapper;
    private final ReportService reportService;
    /* ========== CONFIG ========== */
    @Value("${upload.dir:uploads}")
    private String uploadDir; // ./uploads by default
    private boolean windowOpen = true;

    /* ========== WINDOW ========== */
    public boolean toggleWindow() {
        return windowOpen = !windowOpen;
    }

    public boolean isWindowOpen() {
        return windowOpen;
    }

    /* ========== CREATE ========== */
    @Transactional
    public OrderDTO createOrder(OrderInput input) {
        validateOrderWindow();

        User current = userService.getCurrentUserEntity();
        Department dept = Optional.ofNullable(current.getDepartment())
                .orElseThrow(() -> new IllegalStateException("User has no department"));

        Order o = new Order();
        o.setDepartment(dept);
        o.setStatus(OrderStatus.pending);
        o.setCreatedBy(current);
        o = orderRepo.save(o);

        for (OrderItemInput it : input.getItems()) {
            Product p = productRepo.findById(it.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product " + it.getProductId()));
            OrderItem row = OrderItem.builder()
                    .order(o)
                    .product(p)
                    .quantity(it.getQuantity())
                    .build();
            itemRepo.save(row);
        }

        /* notify admin */
        mail.sendOrderNotificationToAdmin(orderMapper.toOrderDTO(o));
        broadcast.orderStatusChanged(new OrderStatusDTO(o.getOrderId(), "pending",
                dept.getDepartmentId(), dept.getName()));

        return orderMapper.toOrderDTO(o);
    }

    /* ========== USER FLOW ========== */

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

    /* ========== ADMIN ACTIONS ========== */

    /** submitted → approved */
    @Transactional
    public OrderDTO approveOrder(Integer id, String comment) {
        Order o = require(id, OrderStatus.submitted);

        o.setStatus(OrderStatus.approved);
        o.setApprovedBy(userService.getCurrentUserEntity());
        o.setAdminComment(comment);
        o.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(o);

        /* trừ kho + cảnh báo thiếu */
        itemRepo.findByOrderOrderId(id).forEach(item -> {
            Product p = item.getProduct();
            productRepo.save(p);
        });

        /* notify creator */
        notifyCreator(o, "approved", "Your stationery order has been approved!");
        mail.sendOrderApprovalNotification(o);
        broadcast.orderStatusChanged(statusDTO(o, "approved"));

        return orderMapper.toOrderDTO(o);
    }

    /** submitted → rejected */
    @Transactional
    public OrderDTO rejectOrder(Integer id, String reason) {
        Order o = require(id, OrderStatus.submitted);

        o.setStatus(OrderStatus.rejected);
        o.setAdminComment(reason);
        o.setApprovedBy(userService.getCurrentUserEntity());
        o.setUpdatedAt(LocalDateTime.now());
        orderRepo.save(o);

        notifyCreator(o, "rejected", "Your stationery order has been rejected!");
        mail.sendOrderRejectionNotification(o, reason);
        broadcast.orderStatusChanged(statusDTO(o, "rejected"));

        return orderMapper.toOrderDTO(o);
    }

    /* ========== HELPERS ========== */

    private Order require(Integer id, OrderStatus expected) {
        Order o = orderRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + id));
        if (o.getStatus() != expected)
            throw new IllegalStateException("Required status: " + expected + "; current: " + o.getStatus());
        return o;
    }

    public Map<String, Boolean> checkOrderPeriod() {
        boolean canOrder = windowOpen || isWithinFirstWeek();
        return Collections.singletonMap("canOrder", canOrder);
    }

    private boolean isWithinFirstWeek() {
        return LocalDate.now().getDayOfMonth() <= 7;
    }

    private void validateOrderWindow() {
        if (!windowOpen && !isWithinFirstWeek())
            throw new IllegalStateException("Ordering window is closed.");
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

    /* ========== SIMPLE GETTERS / REPORTS (giữ nguyên) ========== */
    public List<OrderDTO> getAllOrders() {
        return orderRepo.findAll().stream().map(orderMapper::toOrderDTO).toList();
    }

    public List<OrderDTO> getPendingOrders() {
        return map(orderRepo.findByStatus(OrderStatus.pending));
    }

    public List<OrderDTO> getSubmittedOrders() {
        return map(orderRepo.findByStatus(OrderStatus.submitted));
    }

    public List<OrderDTO> getOrdersByDepartment(int d) {
        return map(orderRepo.findByDepartment_DepartmentId(d));
    }

    public OrderDTO getLatestOrder(int d) {
        return orderRepo.findTopByDepartmentDepartmentIdOrderByCreatedAtDesc(d).map(orderMapper::toOrderDTO)
                .orElse(null);
    }

    public int getPendingOrdersCount() {
        return (int) orderRepo.countByStatus(OrderStatus.pending);
    }

    public int getMonthlyOrdersCount(int y, int m) {
        LocalDateTime s = LocalDateTime.of(y, m, 1, 0, 0);
        return (int) orderRepo.countByCreatedAtBetween(s, s.plusMonths(1));
    }

    public List<OrderDTO> getOrdersByMonthAndYear(Integer m, Integer y) {
        LocalDateTime s = LocalDateTime.of(y, m, 1, 0, 0);
        return map(orderRepo.findByCreatedAtBetween(s, s.plusMonths(1)));
    }

    public List<OrderItemDTO> getOrderItems(int id) {
        return itemRepo.findByOrderOrderId(id).stream().map(itemMapper::toOrderItemDTO).toList();
    }

    public List<ProductOrderSummaryDTO> getTopOrderedProducts(int top) {
        return itemRepo.findTopProducts(PageRequest.of(0, top));
    }

    public Order findById(Integer id) {
        return orderRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order " + id));
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

    private final FileStorageService storage;
public byte[] exportPdf(Integer id) throws IOException {
    Order o = require(id, OrderStatus.pending);
    // generate PDF bytes via ReportService (reuse)
    byte[] pdf = reportService.exportSingleOrder(o); // create helper
    storage.savePdf(id,pdf);
    o.setStatus(OrderStatus.exported);
    orderRepo.save(o);
    return pdf;
}

}
