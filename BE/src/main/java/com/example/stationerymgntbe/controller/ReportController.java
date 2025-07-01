package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Unified Report Controller - Handles all reporting functionality
 * Combines endpoints from ReportController, EnhancedReportController, and Phase2ReportController
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /* ════════════════════════ CORE REPORT ENDPOINTS ═════════════════════════ */

    /**
     * Basic monthly summary - Legacy endpoint for existing frontend
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> summary(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(reportService.fetchMonthly(year, month).getSummary());
    }

    /**
     * Full monthly report with orders, summary, and charts
     */
    @GetMapping("/full")
    @PreAuthorize("hasRole('ADMIN')")
    public MonthlyReportDTO full(@RequestParam int year, @RequestParam int month) {
        return reportService.fetchMonthly(year, month);
    }

    /* ════════════════════════ EXPORT ENDPOINTS ═════════════════════════ */

    /**
     * Export monthly report to Excel
     */
    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportExcel(@RequestParam String month) throws Exception {
        String[] p = month.split("-");
        int y = Integer.parseInt(p[0]);
        int m = Integer.parseInt(p[1]);
        byte[] body = reportService.export(y, m, "excel");
        String fn = "report_%d_%02d.xlsx".formatted(y, m);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fn)
                .body(body);
    }

    /**
     * Export monthly report to PDF
     */
    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportPdf(@RequestParam String month) throws Exception {
        String[] p = month.split("-");
        int y = Integer.parseInt(p[0]);
        int m = Integer.parseInt(p[1]);
        byte[] body = reportService.export(y, m, "pdf");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=report_%d_%02d.pdf".formatted(y, m))
                .body(body);
    }

    /* ════════════════════════ ANALYTICS ENDPOINTS ═════════════════════════ */

    /**
     * Department Analytics - Enhanced department-level statistics
     */
    @GetMapping("/analytics/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDepartmentAnalytics(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Object> analytics = reportService.getDepartmentAnalytics(year, month);
        return ResponseEntity.ok(analytics);
    }

    /**
     * Product Trends - Multi-month trend analysis
     */
    @GetMapping("/analytics/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getProductTrends(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "6") int months) {
        Map<String, Object> trends = reportService.getProductTrends(year, month, months);
        return ResponseEntity.ok(trends);
    }

    /**
     * Period Comparison - Compare two time periods
     */
    @GetMapping("/analytics/comparison")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getComparison(
            @RequestParam int currentYear,
            @RequestParam int currentMonth,
            @RequestParam int compareYear,
            @RequestParam int compareMonth) {
        Map<String, Object> comparison = reportService.getComparison(
            currentYear, currentMonth, compareYear, compareMonth);
        return ResponseEntity.ok(comparison);
    }

    /**
     * Real-time Statistics - Dashboard metrics
     */
    @GetMapping("/analytics/realtime")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRealtimeStats() {
        Map<String, Object> stats = reportService.getRealtimeStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Category Distribution - Enhanced category analysis
     */
    @GetMapping("/analytics/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCategoryDistribution(
            @RequestParam int year,
            @RequestParam int month) {
        Map<String, Object> distribution = reportService.getCategoryDistribution(year, month);
        return ResponseEntity.ok(distribution);
    }

    /* ════════════════════════ ADVANCED FILTERING ═════════════════════════ */

    /**
     * Advanced Filtered Analytics
     */
    @PostMapping("/analytics/filtered")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFilteredAnalytics(
            @RequestBody Map<String, Object> filters) {
        Map<String, Object> analytics = reportService.getFilteredAnalytics(filters);
        return ResponseEntity.ok(analytics);
    }

    /**
     * Custom Date Range Analytics
     */
    @GetMapping("/analytics/daterange")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCustomDateRangeAnalytics(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        Map<String, Object> analytics = reportService.getCustomDateRangeAnalytics(start, end);
        return ResponseEntity.ok(analytics);
    }

    /* ════════════════════════ SYSTEM HEALTH & PERFORMANCE ═════════════════════════ */

    /**
     * System Health Metrics
     */
    @GetMapping("/system/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemHealthMetrics() {
        Map<String, Object> health = reportService.getSystemHealthMetrics();
        return ResponseEntity.ok(health);
    }

    /* ════════════════════════ FILTER OPTIONS ═════════════════════════ */

    /**
     * Get Filter Options for Advanced Filtering
     */
    @GetMapping("/filter-options")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Map<String, Object> options = reportService.getFilterOptions();
        return ResponseEntity.ok(options);
    }

    /* ════════════════════════ DASHBOARD ENDPOINTS ═════════════════════════ */

    /**
     * Complete Dashboard Data - All analytics in one call
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardData(
            @RequestParam int year,
            @RequestParam int month) {
        
        Map<String, Object> dashboard = Map.of(
            "departmentAnalytics", reportService.getDepartmentAnalytics(year, month),
            "productTrends", reportService.getProductTrends(year, month, 6),
            "categoryDistribution", reportService.getCategoryDistribution(year, month),
            "realtimeStats", reportService.getRealtimeStats(),
            "systemHealth", reportService.getSystemHealthMetrics(),
            "metadata", Map.of(
                "year", year,
                "month", month,
                "generatedAt", LocalDateTime.now(),
                "version", "unified-v1.0"
            )
        );
        
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Enhanced Dashboard with Comparison
     */
    @GetMapping("/dashboard/enhanced")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getEnhancedDashboard(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Integer compareYear,
            @RequestParam(required = false) Integer compareMonth) {
        
        Map<String, Object> dashboard = Map.of(
            "current", Map.of(
                "departmentAnalytics", reportService.getDepartmentAnalytics(year, month),
                "categoryDistribution", reportService.getCategoryDistribution(year, month),
                "productTrends", reportService.getProductTrends(year, month, 3)
            ),
            "comparison", (compareYear != null && compareMonth != null) ? 
                reportService.getComparison(year, month, compareYear, compareMonth) : null,
            "realtime", reportService.getRealtimeStats(),
            "systemHealth", reportService.getSystemHealthMetrics(),
            "filterOptions", reportService.getFilterOptions(),
            "metadata", Map.of(
                "currentPeriod", year + "-" + String.format("%02d", month),
                "comparisonPeriod", (compareYear != null && compareMonth != null) ? 
                    compareYear + "-" + String.format("%02d", compareMonth) : null,
                "generatedAt", LocalDateTime.now(),
                "version", "enhanced-v1.0"
            )
        );
        
        return ResponseEntity.ok(dashboard);
    }
}