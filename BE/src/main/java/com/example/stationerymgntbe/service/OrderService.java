package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.enums.OrderStatus;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.OrderItemMapper;
import com.example.stationerymgntbe.mapper.OrderMapper;
import com.example.stationerymgntbe.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        order = orderRepo.save(order);

        for (OrderItemInput it : input.getItems()) {
            Product p = productRepo.findById(it.getProductId())
                                   .orElseThrow(() -> new ResourceNotFoundException("Product "+ it.getProductId()));
            if (p.getStock() < it.getQuantity())
                throw new IllegalStateException("Insufficient stock for "+ p.getName());

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(it.getQuantity());
            itemRepo.save(oi);
        }

        mail.sendOrderNotificationToAdmin(orderMapper.toOrderDTO(order));
        broadcast.orderStatusChanged(new OrderStatusDTO(order.getOrderId(),"pending",
                dept.getDepartmentId(), dept.getName()));

        return orderMapper.toOrderDTO(order);
    }

    /*
     * ─────────────────────────────
     * APPROVE ORDER
     * ─────────────────────────────
     */
    @Transactional
    public OrderDTO approveOrder(Integer id) {

        Order order = orderRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + id));

        if (order.getStatus() != OrderStatus.pending)
            return orderMapper.toOrderDTO(order);

        order.setStatus(OrderStatus.approved);
        order.setUpdatedAt(LocalDateTime.now());
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepo.save(order);

        itemRepo.findByOrderOrderId(id).forEach(item -> {
            Product p = item.getProduct();
            p.setStock(p.getStock() - item.getQuantity());
            productRepo.save(p);

            if (p.getStock() < 5) { // ngưỡng cảnh báo
                broadcast.stockChanged(new StockUpdateDTO(
                        p.getProductId(), p.getName(), p.getStock()));
            }
        });

        mail.sendOrderApprovalNotification(order);
        broadcast.orderStatusChanged(new OrderStatusDTO(
                id, "approved",
                order.getDepartment().getDepartmentId(),
                order.getDepartment().getName()));

        return orderMapper.toOrderDTO(order);
    }

    /*
     * ─────────────────────────────
     * REJECT ORDER
     * ─────────────────────────────
     */
    @Transactional
    public OrderDTO rejectOrder(Integer id, String comment) {

        Order order = orderRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + id));

        order.setStatus(OrderStatus.rejected);
        order.setUpdatedAt(LocalDateTime.now());
        order.setAdminComment(comment);
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepo.save(order);

        mail.sendOrderRejectionNotification(order, comment);
        broadcast.orderStatusChanged(new OrderStatusDTO(
                id, "rejected",
                order.getDepartment().getDepartmentId(),
                order.getDepartment().getName()));

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
        return orderRepo.findByStatus(OrderStatus.pending).stream()
                .map(orderMapper::toOrderDTO).toList();
    }

    public List<OrderDTO> getOrdersByDepartment(int deptId) {
        return orderRepo.findByDepartment_DepartmentId(deptId).stream()
                .map(orderMapper::toOrderDTO).toList();
    }

    public List<OrderItemDTO> getOrderItems(int orderId) {
        if (!orderRepo.existsById(orderId))
            throw new ResourceNotFoundException("Order " + orderId);
        return itemRepo.findByOrderOrderId(orderId).stream()
                .map(itemMapper::toOrderItemDTO).toList();
    }

    public int getPendingOrdersCount() {
        return (int) orderRepo.countByStatus(OrderStatus.pending); // cast đơn giản
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
        return orderRepo.findByCreatedAtBetween(start, end).stream()
                .map(orderMapper::toOrderDTO).toList();
    }
    private boolean isWithinFirstWeek() {
        return LocalDate.now().getDayOfMonth() <= 7;
    }
    
    public Map<String, Boolean> checkOrderPeriod() {
        boolean canOrder = windowOpen || isWithinFirstWeek();
        return Collections.singletonMap("canOrder", canOrder);
    }
    
    private void validateOrderWindow() {
        if (!windowOpen || !isWithinFirstWeek())
            throw new IllegalStateException("Ordering window is closed.");
    }

    // src/main/java/com/example/stationerymgntbe/service/OrderService.java

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
        order.getDepartment().getName()
    ));
    return orderMapper.toOrderDTO(order);
}

}
