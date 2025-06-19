package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.ProductService;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final OrderService orderService;
    private final ProductService productService;
    private final UserService userService;

    /* ─────────── OVERVIEW STATS ─────────── */

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Get all stats
        List<DepartmentUserCountDTO> departmentStats = userService.getDepartmentStats();
        OrderStatsDTO orderStats = OrderStatsDTO.fromMap(orderService.getCurrentMonthOrderStats());
        AdminWorkflowStatsDTO workflowStats = AdminWorkflowStatsDTO.fromMap(orderService.getAdminWorkflowStats());
        
        overview.put("departments", departmentStats);
        overview.put("orders", orderStats);
        overview.put("workflow", workflowStats);
        
        return ResponseEntity.ok(overview);
    }

    /* ─────────── DEPARTMENT STATS ─────────── */

    @GetMapping("/departments/stats")
    public ResponseEntity<List<DepartmentUserCountDTO>> getDepartmentStats() {
        return ResponseEntity.ok(userService.getDepartmentStats());
    }

    @GetMapping("/departments/pending-orders")
    public ResponseEntity<List<DepartmentUserCountDTO>> getDepartmentsPendingOrders() {
        return ResponseEntity.ok(userService.getDepartmentsPendingOrders());
    }

    /* ─────────── ORDER STATS ─────────── */

    @GetMapping("/orders/current-month")
    public ResponseEntity<OrderStatsDTO> getCurrentMonthOrderStats() {
        Map<String, Object> stats = orderService.getCurrentMonthOrderStats();
        return ResponseEntity.ok(OrderStatsDTO.fromMap(stats));
    }

    @GetMapping("/orders/monthly-summary")
    public ResponseEntity<MonthlyOrderSummaryDTO> getMonthlyOrderSummary(
            @RequestParam(defaultValue = "12") int months) {
        Map<String, Object> summary = orderService.getMonthlyOrderSummary(months);
        return ResponseEntity.ok(MonthlyOrderSummaryDTO.fromMap(summary));
    }

    @GetMapping("/orders/status-distribution")
    public ResponseEntity<Map<String, Long>> getOrderStatusDistribution() {
        return ResponseEntity.ok(orderService.getOrderStatusDistribution());
    }

    @GetMapping("/orders/submission-timeline")
    public ResponseEntity<List<Map<String, Object>>> getOrderSubmissionTimeline() {
        return ResponseEntity.ok(orderService.getOrderSubmissionTimeline());
    }

    @GetMapping("/orders/completion-rate")
    public ResponseEntity<Map<String, Object>> getOrderCompletionRate() {
        return ResponseEntity.ok(orderService.getOrderCompletionRate());
    }

    @GetMapping("/orders/document-upload-success")
    public ResponseEntity<Map<String, Object>> getDocumentUploadSuccessRate() {
        return ResponseEntity.ok(orderService.getDocumentUploadSuccessRate());
    }

    /* ─────────── WORKFLOW STATS ─────────── */

    @GetMapping("/workflow/stats")
    public ResponseEntity<AdminWorkflowStatsDTO> getAdminWorkflowStats() {
        Map<String, Object> stats = orderService.getAdminWorkflowStats();
        return ResponseEntity.ok(AdminWorkflowStatsDTO.fromMap(stats));
    }

    /* ─────────── QUICK ACTIONS ─────────── */

    @GetMapping("/quick-stats")
    public ResponseEntity<Map<String, Object>> getQuickStats() {
        Map<String, Object> quickStats = new HashMap<>();
        
        // Quick numbers for dashboard cards
        quickStats.put("pendingOrdersCount", orderService.getPendingOrdersCount());
        quickStats.put("submittedOrdersCount", orderService.getSubmittedOrders().size());
        quickStats.put("totalUsersCount", userService.getAllUsers().size());
        
        return ResponseEntity.ok(quickStats);
    }

    /* ─────────── CHARTS DATA ─────────── */

    @GetMapping("/charts/orders-by-status")
    public ResponseEntity<Map<String, Long>> getOrdersByStatusChart() {
        return ResponseEntity.ok(orderService.getOrderStatusDistribution());
    }

    @GetMapping("/charts/monthly-orders")
    public ResponseEntity<MonthlyOrderSummaryDTO> getMonthlyOrdersChart(
            @RequestParam(defaultValue = "6") int months) {
        Map<String, Object> summary = orderService.getMonthlyOrderSummary(months);
        return ResponseEntity.ok(MonthlyOrderSummaryDTO.fromMap(summary));
    }
}