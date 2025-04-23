// src/main/java/com/example/stationerymgntbe/controller/OrderController.java
package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.dto.OrderInput;
import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final SimpMessagingTemplate broker;


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable Integer orderId) {
        return ResponseEntity.ok(orderService.getOrderItems(orderId));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderInput orderInput) {
        System.out.println("Incoming orderInput: " + orderInput); // debug
        return ResponseEntity.ok(orderService.createOrder(orderInput));
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
        return ResponseEntity.ok(orderService.approveOrder(orderId));
    }

    @PutMapping("/{orderId}/reject")
    public ResponseEntity<OrderDTO> rejectOrder(@PathVariable Integer orderId, @RequestParam String comment) {
        return ResponseEntity.ok(orderService.rejectOrder(orderId, comment));
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Integer>> getPendingOrdersCount() {
        return ResponseEntity.ok(Map.of("count", orderService.getPendingOrdersCount()));
    }

    @GetMapping("/monthly-count")
    public ResponseEntity<Integer> getMonthlyOrdersCount() {
        LocalDate now = LocalDate.now();
        return ResponseEntity.ok(orderService.getMonthlyOrdersCount(now.getYear(), now.getMonthValue()));
    }

    @GetMapping("/latest")
    public ResponseEntity<OrderDTO> getLatestOrder(Principal principal) {
        Integer departmentId = userService.getCurrentUser().getDepartmentId();
        return ResponseEntity.ok(orderService.getLatestOrder(departmentId));
    }

    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getMonthlyReport(@RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(orderService.getOrdersByMonthAndYear(month, year));
    }

    private boolean open = false;

    @PostMapping("/order-window/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String,Boolean>> toggleWindow() {
        boolean open = orderService.toggleWindow();      // 👉 ADD – trả về trạng thái mới
        broker.convertAndSend("/topic/order-window", Map.of("open", open)); // realtime
        return ResponseEntity.ok( Map.of("open", open) );
    }

    /** public – mọi client cần biết cửa sổ đang mở hay không */
    @GetMapping("/order-window/status")
    public ResponseEntity<Map<String,Boolean>> windowStatus() {
        return ResponseEntity.ok( Map.of("open", orderService.isWindowOpen()) );
    }
    @PutMapping("/{orderId}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<OrderDTO> updateOrderComment(
        @PathVariable Integer orderId,
        @RequestBody Map<String, String> body
) {
    String comment = body.get("adminComment");
    OrderDTO updated = orderService.updateComment(orderId, comment);
    broker.convertAndSend("/topic/orders/admin", updated);
    return ResponseEntity.ok(updated);
}
}