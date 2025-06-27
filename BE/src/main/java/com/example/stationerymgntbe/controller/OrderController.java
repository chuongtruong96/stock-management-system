package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.OrderService;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    // ============================================================================
    // ORDER CREATION AND MANAGEMENT
    // ============================================================================

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDetailDTO>> createOrder(@RequestBody OrderInput input) {
        log.info("Creating order with {} items", input.getItems().size());
        ApiResponse<OrderDetailDTO> response = orderService.createOrder(input);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<Page<OrderSummaryDTO>>> getMyOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Integer userId = userService.getCurrentUser().getId();
        ApiResponse<Page<OrderSummaryDTO>> response = orderService.getUserOrders(userId, pageable);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailDTO>> getOrderDetails(@PathVariable Integer id) {
        log.info("Retrieving order details for order: {}", id);
        ApiResponse<OrderDetailDTO> response = orderService.getOrderDetails(id);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<OrderItemDetailDTO>>> getOrderItems(@PathVariable Integer id) {
        log.info("Retrieving order items for order: {}", id);
        ApiResponse<List<OrderItemDetailDTO>> response = orderService.getOrderItems(id);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }

    // ============================================================================
    // ORDER WORKFLOW ENDPOINTS
    // ============================================================================

    @PostMapping("/{id}/export")
    public ResponseEntity<?> exportOrderPDF(@PathVariable Integer id) {
        try {
            log.info("Exporting PDF for order: {}", id);
            
            // First update the order status and get the response
            ApiResponse<OrderDetailDTO> statusResponse = orderService.exportOrderPDF(id);
            
            if (!statusResponse.isSuccess()) {
                return ResponseEntity.badRequest().body(statusResponse);
            }
            
            // Then generate and return the actual PDF
            byte[] pdfData = orderService.generateOrderPDF(id);
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=order-" + id + ".pdf")
                .body(pdfData);
                
        } catch (Exception e) {
            log.error("Error exporting PDF for order: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to export PDF: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}/submit-signed", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrderDetailDTO>> submitSignedOrder(
            @PathVariable Integer id,
            @RequestPart("file") MultipartFile signedPdf) {
        
        log.info("Submitting signed PDF for order: {}", id);
        ApiResponse<OrderDetailDTO> response = orderService.submitSignedOrder(id, signedPdf);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    // ============================================================================
    // ADMIN ENDPOINTS
    // ============================================================================

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDetailDTO>> approveOrder(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        
        String adminComment = body != null ? body.get("adminComment") : null;
        log.info("Approving order: {} with comment: {}", id, adminComment);
        
        ApiResponse<OrderDetailDTO> response = orderService.approveOrder(id, adminComment);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDetailDTO>> rejectOrder(
            @PathVariable Integer id,
            @RequestParam String reason) {
        
        log.info("Rejecting order: {} with reason: {}", id, reason);
        ApiResponse<OrderDetailDTO> response = orderService.rejectOrder(id, reason);
        
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderSummaryDTO>>> getPendingOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        
        ApiResponse<Page<OrderSummaryDTO>> response = orderService.getPendingOrders(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/submitted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderSummaryDTO>>> getSubmittedOrders(
            @PageableDefault(size = 20) Pageable pageable) {
        
        ApiResponse<Page<OrderSummaryDTO>> response = orderService.getSubmittedOrders(pageable);
        return ResponseEntity.ok(response);
    }

    // ============================================================================
    // FILE DOWNLOAD ENDPOINTS
    // ============================================================================

    @GetMapping("/{id}/signed-file")
    public ResponseEntity<?> downloadSignedFile(@PathVariable Integer id) {
        try {
            log.info("Downloading signed file for order: {}", id);
            
            byte[] pdfData = orderService.getSignedPDF(id);
            ByteArrayResource resource = new ByteArrayResource(pdfData);
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"order-" + id + "-signed.pdf\"")
                .body(resource);
                
        } catch (Exception e) {
            log.error("Error downloading signed file for order: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Signed file not found: " + e.getMessage()));
        }
    }

    // ============================================================================
    // ORDER WINDOW MANAGEMENT
    // ============================================================================

    @PostMapping("/order-window/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleOrderWindow() {
        try {
            boolean isOpen = orderService.toggleOrderWindow();
            Map<String, Boolean> result = Map.of("open", isOpen);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Order window " + (isOpen ? "opened" : "closed"), result));
                
        } catch (Exception e) {
            log.error("Error toggling order window", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to toggle order window: " + e.getMessage()));
        }
    }

    @GetMapping("/order-window/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getOrderWindowStatus() {
        try {
            boolean isOpen = orderService.isOrderWindowOpen();
            Map<String, Boolean> result = Map.of("open", isOpen);
            
            return ResponseEntity.ok(ApiResponse.success("Order window status retrieved", result));
            
        } catch (Exception e) {
            log.error("Error getting order window status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to get order window status: " + e.getMessage()));
        }
    }

    @GetMapping("/check-period")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkOrderPeriod() {
        try {
            Map<String, Object> result = orderService.checkOrderPeriod();
            
            return ResponseEntity.ok(ApiResponse.success("Order period status retrieved", result));
            
        } catch (Exception e) {
            log.error("Error checking order period", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to check order period: " + e.getMessage()));
        }
    }

    // ============================================================================
    // STATISTICS AND REPORTING
    // ============================================================================

    @GetMapping("/statistics/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderStatistics() {
        try {
            Map<String, Object> statistics = orderService.getOrderStatistics();
            return ResponseEntity.ok(ApiResponse.success("Order statistics retrieved", statistics));
            
        } catch (Exception e) {
            log.error("Error retrieving order statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/reports/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderSummaryDTO>>> getMonthlyReport(
            @RequestParam Integer month,
            @RequestParam Integer year,
            @PageableDefault(size = 50) Pageable pageable) {
        
        try {
            Page<OrderSummaryDTO> report = orderService.getMonthlyReport(year, month, pageable);
            return ResponseEntity.ok(ApiResponse.success("Monthly report generated", report));
            
        } catch (Exception e) {
            log.error("Error generating monthly report for {}/{}", month, year, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate monthly report: " + e.getMessage()));
        }
    }
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderSummaryDTO>>> getAllOrders(
    @PageableDefault(size = 20) Pageable pageable) {
    
    log.info("Admin retrieving all orders via OrderController");
    ApiResponse<Page<OrderSummaryDTO>> response = orderService.getAllOrders(pageable);
    return ResponseEntity.ok(response);
    }
    }