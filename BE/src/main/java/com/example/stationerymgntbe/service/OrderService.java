package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.dto.OrderInput;
import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.dto.OrderItemInput;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.enums.OrderStatus;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.OrderItemMapper;
import com.example.stationerymgntbe.mapper.OrderMapper;
import com.example.stationerymgntbe.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final UserService userService;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Boolean> checkOrderPeriod() {
        LocalDate today = LocalDate.now();
        // boolean canOrder = (today.getDayOfMonth() <= 30);
        boolean canOrder = true;
        return Collections.singletonMap("canOrder", canOrder);
    }

    @Transactional
    public OrderDTO createOrder(OrderInput orderInput) {
        // 1) get current user
        User currentUser = userService.getCurrentUserEntity();
        Department dept = Objects.requireNonNull(currentUser.getDepartment(),
                "Current user is not associated with a department");

        // 2) check ordering window
        if (!checkOrderPeriod().get("canOrder")) {
            throw new RuntimeException("Ordering window is closed for this month.");
        }

        // 3) build & save new order
        Order order = new Order();
        order.setDepartment(dept);
        order.setStatus(OrderStatus.pending);
        order = orderRepository.save(order);

        // 4) create & attach order items
        for (OrderItemInput itemInput : orderInput.getItems()) {
            Product product = productRepository.findById(itemInput.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemInput.getProductId()));

            if (product.getStock() < itemInput.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemInput.getQuantity());
            orderItemRepository.save(orderItem);
        }

        // 5) notify admin
        emailService.sendOrderNotificationToAdmin(orderMapper.toOrderDTO(order));

        // 6) return the newly created order as a DTO
        return orderMapper.toOrderDTO(order);
    }

    @Transactional
    public OrderDTO approveOrder(Integer orderId) {
        // 1) find order & mark as approved
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(OrderStatus.approved);
        order.setUpdatedAt(LocalDateTime.now());
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepository.save(order);

        // 2) reduce product stock
        List<OrderItem> items = new ArrayList<>(orderItemRepository.findByOrderOrderId(orderId));
        for (OrderItem item : items) {
            Product product = item.getProduct();
            int newStock = product.getStock() - item.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(newStock);
            productRepository.save(product);
        }

        // 3) notify department
        emailService.sendOrderApprovalNotification(order);

        return orderMapper.toOrderDTO(order);
    }

    @Transactional
    public OrderDTO rejectOrder(Integer orderId, String comment) {
        // 1) find order & mark as rejected
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(OrderStatus.rejected);
        order.setUpdatedAt(LocalDateTime.now());
        order.setAdminComment(comment);
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepository.save(order);

        // 2) notify department
        emailService.sendOrderRejectionNotification(order, comment);

        return orderMapper.toOrderDTO(order);
    }

    public List<OrderDTO> getPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.pending).stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    // convenience to get a department's orders
    public List<OrderDTO> getOrdersByDepartment(Integer departmentId) {
        return orderRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public List<OrderItemDTO> getOrderItems(Integer orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        return orderItemRepository.findByOrderOrderId(orderId).stream()
                .map(orderItemMapper::toOrderItemDTO)
                .collect(Collectors.toList());
    }

    public int getPendingOrdersCount() {
        return (int) orderRepository.countByStatus(OrderStatus.pending);
    }

    public int getMonthlyOrdersCount(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return (int) orderRepository.countByCreatedAtBetween(start, end);
    }

    public OrderDTO getLatestOrder(Integer departmentId) {
        return orderRepository.findTopByDepartmentDepartmentIdOrderByCreatedAtDesc(departmentId)
                .map(orderMapper::toOrderDTO)
                .orElse(null);
    }

    public List<OrderDTO> getOrdersByMonthAndYear(Integer month, Integer year) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return orderRepository.findByCreatedAtBetween(start, end).stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    private void validateOrderWindow() {
        if (!checkOrderPeriod().get("canOrder")) {
            throw new RuntimeException("Ordering window is closed.");
        }
    }
}
