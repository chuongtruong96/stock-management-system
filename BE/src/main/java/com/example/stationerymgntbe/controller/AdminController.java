package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller for basic admin operations
 * Provides simple endpoints that the frontend admin pages expect
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;

    // ============================================================================
    // USER MANAGEMENT
    // ============================================================================

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        try {
            List<UserSummaryDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable Integer id) {
        try {
            UserDetailDTO user = userService.getUserDetailById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error fetching user: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    // ============================================================================
    // ORDER MANAGEMENT
    // ============================================================================

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderSummaryDTO>> getAllOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            // Get all orders (pending + submitted + approved + rejected)
            ApiResponse<Page<OrderSummaryDTO>> pendingResponse = orderService.getAllOrders(pageable);
            
            if (pendingResponse.isSuccess()) {
                return ResponseEntity.ok(pendingResponse.getData());
            } else {
                log.error("Failed to fetch orders: {}", pendingResponse.getMessage());
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error fetching orders", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<Page<OrderSummaryDTO>> getPendingOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            ApiResponse<Page<OrderSummaryDTO>> response = orderService.getPendingOrders(pageable);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response.getData());
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error fetching pending orders", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/orders/submitted")
    public ResponseEntity<Page<OrderSummaryDTO>> getSubmittedOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            ApiResponse<Page<OrderSummaryDTO>> response = orderService.getSubmittedOrders(pageable);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response.getData());
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error fetching submitted orders", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============================================================================
    // ORDER WINDOW MANAGEMENT
    // ============================================================================

    @PostMapping("/order-window/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleOrderWindow() {
        try {
            boolean newStatus = orderService.toggleOrderWindow();
            Map<String, Boolean> result = Map.of("open", newStatus);
            
            log.info("Order window toggled to: {}", newStatus ? "OPEN" : "CLOSED");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error toggling order window", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/order-window/status")
    public ResponseEntity<Map<String, Boolean>> getOrderWindowStatus() {
        try {
            boolean isOpen = orderService.isOrderWindowOpen();
            Map<String, Boolean> result = Map.of("open", isOpen);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting order window status", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAdminStatistics() {
        try {
            Map<String, Object> stats = Map.of(
                "totalUsers", userService.getAllUsers().size(),
                "pendingOrders", orderService.getPendingOrdersCount(),
                "submittedOrders", orderService.getSubmittedOrders().size(),
                "orderStats", orderService.getOrderStatistics()
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching admin statistics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============================================================================
    // ORDER ACTIONS
    // ============================================================================

    @PutMapping("/orders/{id}/approve")
    public ResponseEntity<OrderDetailDTO> approveOrder(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String adminComment = body != null ? body.get("adminComment") : "";
            ApiResponse<OrderDetailDTO> response = orderService.approveOrder(id, adminComment);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response.getData());
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            log.error("Error approving order: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/orders/{id}/reject")
    public ResponseEntity<OrderDetailDTO> rejectOrder(
            @PathVariable Integer id,
            @RequestParam String reason) {
        try {
            ApiResponse<OrderDetailDTO> response = orderService.rejectOrder(id, reason);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response.getData());
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            log.error("Error rejecting order: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}