package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.dto.OrderInput;
import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable Integer orderId) {
        try {
            List<OrderItemDTO> orderItems = orderService.getOrderItems(orderId);
            return ResponseEntity.ok(orderItems);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderInput orderInput) {
        try {
            return ResponseEntity.ok(orderService.createOrder(orderInput));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @GetMapping("/check-period")
    public ResponseEntity<Map<String, Boolean>> checkOrderPeriod() {
        return ResponseEntity.ok(orderService.checkOrderPeriod());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<OrderDTO>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getPendingOrders());
    }

    @PutMapping("/{orderId}/approve")
    public ResponseEntity<OrderDTO> approveOrder(@PathVariable Integer orderId) {
        try {
            return ResponseEntity.ok(orderService.approveOrder(orderId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PutMapping("/{orderId}/reject")
    public ResponseEntity<OrderDTO> rejectOrder(@PathVariable Integer orderId, @RequestParam String comment) {
        try {
            return ResponseEntity.ok(orderService.rejectOrder(orderId, comment));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Integer>> getPendingOrdersCount() {
        return ResponseEntity.ok(Collections.singletonMap("count", orderService.getPendingOrdersCount()));
    }

    @GetMapping("/monthly-count")
    public ResponseEntity<Map<String, Integer>> getMonthlyOrdersCount() {
        LocalDate now = LocalDate.now();
        return ResponseEntity.ok(Collections.singletonMap("count",
                orderService.getMonthlyOrdersCount(now.getYear(), now.getMonthValue())));
    }

    @GetMapping("/latest")
    public ResponseEntity<OrderDTO> getLatestOrder(Principal principal) {
        UserResponseDTO userResponseDTO = userService.getCurrentUser();
        Integer departmentId = userResponseDTO.getEmployee().getDepartment().getDepartmentId();
        return ResponseEntity.ok(orderService.getLatestOrder(departmentId));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<OrderDTO>> getMonthlyReport(@RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(orderService.getOrdersByMonthAndYear(month, year));
    }
}