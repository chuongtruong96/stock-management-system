package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.dto.OrderInput;
import com.example.stationerymgntbe.dto.OrderItemInput;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.enums.OrderStatus;
import com.example.stationerymgntbe.mapper.OrderItemMapper;
import com.example.stationerymgntbe.mapper.OrderMapper;
import com.example.stationerymgntbe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Boolean> checkOrderPeriod() {
        LocalDate today = LocalDate.now();
        boolean canOrder = today.getDayOfMonth() <= 7;
        return Collections.singletonMap("canOrder", canOrder);
    }

    @Transactional
    public OrderDTO createOrder(OrderInput orderInput) {
        User currentUser = userService.getCurrentUserEntity();
        Employee employee = currentUser.getEmployee();

        Order order = new Order();
        order.setEmployee(employee);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.pending);
        order = orderRepository.save(order);

        for (OrderItemInput itemInput : orderInput.getItems()) {
            Product product = productRepository.findById(itemInput.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemInput.getProductId()));

            if (product.getStock() < itemInput.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemInput.getQuantity());
            orderItemRepository.save(orderItem);
        }

        sendEmailToAdmin(order);

        order = orderRepository.findByIdWithDetails(order.getOrderId()).orElseThrow();
        return orderMapper.toOrderDTO(order);
    }

    @Transactional
    public OrderDTO approveOrder(Integer orderId) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(OrderStatus.approved);
        order.setUpdatedAt(LocalDateTime.now());
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepository.save(order);

        Collection<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            int newStock = product.getStock() - item.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(newStock);
            productRepository.save(product);
        }

        sendEmailToDepartment(order);

        order = orderRepository.findByIdWithDetails(orderId).orElseThrow();
        return orderMapper.toOrderDTO(order);
    }

    @Transactional
    public OrderDTO rejectOrder(Integer orderId, String comment) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(OrderStatus.rejected);
        order.setUpdatedAt(LocalDateTime.now());
        order.setAdminComment(comment);
        order.setApprovedBy(userService.getCurrentUserEntity());
        orderRepository.save(order);

        sendEmailToDepartment(order);

        order = orderRepository.findByIdWithDetails(orderId).orElseThrow();
        return orderMapper.toOrderDTO(order);
    }

    public List<OrderDTO> getPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.pending).stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    private void sendEmailToAdmin(Order order) {
        String subject = "New Order Submitted - Order #" + order.getOrderId();
        String body = "A new order has been submitted by " + order.getEmployee().getFirstName() + " " +
                order.getEmployee().getLastName() + " from " + order.getEmployee().getDepartment().getName() +
                ".\nPlease review the order.";
        emailService.sendEmail("admin@company.com", subject, body);
    }

    private void sendEmailToDepartment(Order order) {
        String recipientEmail = order.getEmployee().getDepartment().getEmail();
        String subject = "Order Status Update - Order #" + order.getOrderId();
        String body = "Your order has been " + order.getStatus() + ".\nComment: " +
                (order.getAdminComment() != null ? order.getAdminComment() : "N/A");
        emailService.sendEmail(recipientEmail, subject, body);
    }

    public List<OrderDTO> getOrdersByDepartment(Integer departmentId) {
        return orderRepository.findByEmployeeDepartmentDepartmentId(departmentId)
                .stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public List<OrderItemDTO> getOrderItems(Integer orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        return orderItemRepository.findByOrderOrderId(orderId)
                .stream()
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
        Order order = orderRepository.findTopByEmployeeDepartmentDepartmentIdOrderByCreatedAtDesc(departmentId)
                .orElse(null);
        return order != null ? orderMapper.toOrderDTO(order) : null;
    }

    public List<OrderDTO> getOrdersByMonthAndYear(Integer month, Integer year) {
        return orderRepository.findByCreatedAtBetween(
            LocalDateTime.of(year, month, 1, 0, 0),
            LocalDateTime.of(year, month, LocalDateTime.now().getDayOfMonth(), 23, 59, 59)
        ).stream().map(orderMapper::toOrderDTO).collect(Collectors.toList());
    }
}