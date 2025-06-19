// Enhanced Backend Services for Stationery Management System

// ============================================================================
// 1. ENHANCED ORDER SERVICE
// ============================================================================

package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.enums.OrderStatus;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.exception.InvalidOrderStateException;
import com.example.stationerymgntbe.mapper.*;
import com.example.stationerymgntbe.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnhancedOrderService {

    // Dependencies
    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final UserService userService;
    private final EmailService emailService;
    private final BroadcastService broadcastService;
    private final NotificationService notificationService;
    private final OrderMapper orderMapper;
    private final OrderItemMapper itemMapper;
    private final ReportService reportService;
    private final AuditService auditService;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private boolean windowOpen = true;

    // ============================================================================
    // ORDER CREATION WITH ENHANCED VALIDATION
    // ============================================================================

    @Transactional
    public ApiResponse<OrderDetailDTO> createOrder(OrderInput input) {
        try {
            log.info("Creating order for user: {}", userService.getCurrentUser().getUsername());
            
            // Validate order window
            validateOrderWindow();
            
            // Validate input
            validateOrderInput(input);
            
            User currentUser = userService.getCurrentUserEntity();
            Department department = validateUserDepartment(currentUser);
            
            // Create order entity
            Order order = createOrderEntity(currentUser, department);
            order = orderRepo.save(order);
            
            // Create order items
            List<OrderItem> orderItems = createOrderItems(order, input.getItems());
            
            // Generate order number
            order.setOrderNumber(generateOrderNumber(order.getOrderId(), department.getName()));
            order = orderRepo.save(order);
            
            // Create audit trail
            auditService.logOrderCreation(order, currentUser);
            
            // Send notifications
            sendOrderCreationNotifications(order);
            
            OrderDetailDTO orderDTO = mapToOrderDetailDTO(order);
            
            log.info("Order created successfully: {}", order.getOrderId());
            return ApiResponse.success("Order created successfully", orderDTO);
            
        } catch (Exception e) {
            log.error("Error creating order", e);
            return ApiResponse.error("Failed to create order: " + e.getMessage());
        }
    }

    // ============================================================================
    // ENHANCED ORDER FLOW MANAGEMENT
    // ============================================================================

    @Transactional
    public ApiResponse<OrderDetailDTO> exportOrderPDF(Integer orderId) {
        try {
            log.info("Exporting PDF for order: {}", orderId);
            
            Order order = validateOrderForExport(orderId);
            
            // Generate PDF
            byte[] pdfData = reportService.exportSingleOrder(order);
            
            // Update order status with validation
            updateOrderStatus(order, OrderStatus.EXPORTED, "PDF exported successfully");
            
            // Create audit trail
            auditService.logOrderStatusChange(order, OrderStatus.PENDING, OrderStatus.EXPORTED, 
                userService.getCurrentUser(), "PDF exported");
            
            // Send notifications
            sendOrderExportNotifications(order);
            
            OrderDetailDTO orderDTO = mapToOrderDetailDTO(order);
            
            log.info("PDF exported successfully for order: {}", orderId);
            return ApiResponse.success("PDF exported successfully", orderDTO, 
                Map.of("pdfSize", pdfData.length, "exportedAt", LocalDateTime.now()));
                
        } catch (Exception e) {
            log.error("Error exporting PDF for order: {}", orderId, e);
            return ApiResponse.error("Failed to export PDF: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<OrderDetailDTO> submitSignedOrder(Integer orderId, MultipartFile signedPdf) {
        try {
            log.info("Submitting signed order: {}", orderId);
            
            Order order = validateOrderForSubmission(orderId);
            
            // Validate and save signed PDF
            String pdfPath = saveSignedPDF(orderId, signedPdf);
            order.setSignedPdfPath(pdfPath);
            
            // Update order status
            updateOrderStatus(order, OrderStatus.SUBMITTED, "Signed PDF uploaded and submitted");
            
            // Create audit trail
            auditService.logOrderStatusChange(order, OrderStatus.EXPORTED, OrderStatus.SUBMITTED,
                userService.getCurrentUser(), "Signed PDF uploaded");
            
            // Send notifications
            sendOrderSubmissionNotifications(order);
            
            OrderDetailDTO orderDTO = mapToOrderDetailDTO(order);
            
            log.info("Order submitted successfully: {}", orderId);
            return ApiResponse.success("Order submitted successfully", orderDTO);
            
        } catch (Exception e) {
            log.error("Error submitting order: {}", orderId, e);
            return ApiResponse.error("Failed to submit order: " + e.getMessage());
        }
    }

    // ============================================================================
    // ADMIN APPROVAL WORKFLOW
    // ============================================================================

    @Transactional
    public ApiResponse<OrderDetailDTO> approveOrder(Integer orderId, String adminComment) {
        try {
            log.info("Approving order: {} by admin: {}", orderId, userService.getCurrentUser().getUsername());
            
            Order order = validateOrderForApproval(orderId);
            User admin = userService.getCurrentUserEntity();
            
            // Update order status and details
            order.setStatus(OrderStatus.APPROVED);
            order.setApprovedBy(admin);
            order.setAdminComment(adminComment);
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepo.save(order);
            
            // Process inventory updates (if applicable)
            processInventoryUpdates(order);
            
            // Create audit trail
            auditService.logOrderApproval(order, admin, adminComment);
            
            // Send notifications
            sendOrderApprovalNotifications(order);
            
            OrderDetailDTO orderDTO = mapToOrderDetailDTO(order);
            
            log.info("Order approved successfully: {}", orderId);
            return ApiResponse.success("Order approved successfully", orderDTO);
            
        } catch (Exception e) {
            log.error("Error approving order: {}", orderId, e);
            return ApiResponse.error("Failed to approve order: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<OrderDetailDTO> rejectOrder(Integer orderId, String rejectionReason) {
        try {
            log.info("Rejecting order: {} by admin: {}", orderId, userService.getCurrentUser().getUsername());
            
            Order order = validateOrderForRejection(orderId);
            User admin = userService.getCurrentUserEntity();
            
            // Update order status and details
            order.setStatus(OrderStatus.REJECTED);
            order.setApprovedBy(admin);
            order.setAdminComment(rejectionReason);
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepo.save(order);
            
            // Create audit trail
            auditService.logOrderRejection(order, admin, rejectionReason);
            
            // Send notifications
            sendOrderRejectionNotifications(order, rejectionReason);
            
            OrderDetailDTO orderDTO = mapToOrderDetailDTO(order);
            
            log.info("Order rejected successfully: {}", orderId);
            return ApiResponse.success("Order rejected", orderDTO);
            
        } catch (Exception e) {
            log.error("Error rejecting order: {}", orderId, e);
            return ApiResponse.error("Failed to reject order: " + e.getMessage());
        }
    }

    // ============================================================================
    // ENHANCED QUERY METHODS
    // ============================================================================

    public ApiResponse<Page<OrderSummaryDTO>> getUserOrders(Integer userId, Pageable pageable) {
        try {
            Page<Order> orders = orderRepo.findByCreatedByUserIdOrderByCreatedAtDesc(userId, pageable);
            Page<OrderSummaryDTO> orderDTOs = orders.map(this::mapToOrderSummaryDTO);
            
            return ApiResponse.success("Orders retrieved successfully", orderDTOs,
                Map.of("totalElements", orders.getTotalElements(),
                       "totalPages", orders.getTotalPages()));
                       
        } catch (Exception e) {
            log.error("Error retrieving user orders for user: {}", userId, e);
            return ApiResponse.error("Failed to retrieve orders: " + e.getMessage());
        }
    }

    public ApiResponse<OrderDetailDTO> getOrderDetails(Integer orderId) {
        try {
            Order order = orderRepo.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
            
            // Check access permissions
            validateOrderAccess(order);
            
            OrderDetailDTO orderDTO = mapToOrderDetailDTO(order);
            
            return ApiResponse.success("Order details retrieved successfully", orderDTO);
            
        } catch (Exception e) {
            log.error("Error retrieving order details: {}", orderId, e);
            return ApiResponse.error("Failed to retrieve order details: " + e.getMessage());
        }
    }

    // ============================================================================
    // VALIDATION METHODS
    // ============================================================================

    private void validateOrderWindow() {
        if (!windowOpen && !isWithinFirstWeek()) {
            throw new InvalidOrderStateException("Order window is currently closed");
        }
    }

    private void validateOrderInput(OrderInput input) {
        if (input == null || input.getItems() == null || input.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        
        for (OrderItemInput item : input.getItems()) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid order item: product ID and positive quantity required");
            }
        }
    }

    private Department validateUserDepartment(User user) {
        Department department = user.getDepartment();
        if (department == null) {
            throw new IllegalStateException("User must be assigned to a department to create orders");
        }
        return department;
    }

    private Order validateOrderForExport(Integer orderId) {
        Order order = orderRepo.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Order must be in PENDING status to export PDF");
        }
        
        validateOrderOwnership(order);
        return order;
    }

    private Order validateOrderForSubmission(Integer orderId) {
        Order order = orderRepo.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        if (order.getStatus() != OrderStatus.EXPORTED) {
            throw new InvalidOrderStateException("Order must be in EXPORTED status to submit signed PDF");
        }
        
        validateOrderOwnership(order);
        return order;
    }

    private Order validateOrderForApproval(Integer orderId) {
        Order order = orderRepo.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        if (order.getStatus() != OrderStatus.SUBMITTED) {
            throw new InvalidOrderStateException("Order must be in SUBMITTED status for approval");
        }
        
        return order;
    }

    private Order validateOrderForRejection(Integer orderId) {
        Order order = orderRepo.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        
        if (order.getStatus() != OrderStatus.SUBMITTED) {
            throw new InvalidOrderStateException("Order must be in SUBMITTED status for rejection");
        }
        
        return order;
    }

    private void validateOrderOwnership(Order order) {
        User currentUser = userService.getCurrentUser();
        if (!order.getCreatedBy().getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Access denied: You can only access your own orders");
        }
    }

    private void validateOrderAccess(Order order) {
        User currentUser = userService.getCurrentUser();
        boolean isOwner = order.getCreatedBy().getUserId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole().getName().equals("ADMIN");
        
        if (!isOwner && !isAdmin) {
            throw new SecurityException("Access denied: Insufficient permissions to view this order");
        }
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private Order createOrderEntity(User user, Department department) {
        Order order = new Order();
        order.setDepartment(department);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedBy(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        return order;
    }

    private List<OrderItem> createOrderItems(Order order, List<OrderItemInput> itemInputs) {
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemInput itemInput : itemInputs) {
            Product product = productRepo.findById(itemInput.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemInput.getProductId()));
            
            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(itemInput.getQuantity())
                .build();
            
            orderItems.add(itemRepo.save(orderItem));
        }
        
        return orderItems;
    }

    private String generateOrderNumber(Integer orderId, String departmentName) {
        String deptCode = departmentName.substring(0, Math.min(3, departmentName.length())).toUpperCase();
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8);
        return String.format("ORD-%s-%s-%04d", deptCode, timestamp, orderId);
    }

    private void updateOrderStatus(Order order, OrderStatus newStatus, String comment) {
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        if (comment != null && !comment.trim().isEmpty()) {
            order.setAdminComment(comment);
        }
        
        orderRepo.save(order);
        
        // Broadcast status change
        broadcastService.orderStatusChanged(new OrderStatusDTO(
            order.getOrderId(),
            newStatus.name().toLowerCase(),
            order.getDepartment().getDepartmentId(),
            order.getDepartment().getName()
        ));
    }

    private String saveSignedPDF(Integer orderId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Signed PDF file is required");
        }
        
        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("File must be a PDF");
        }
        
        Path uploadPath = Paths.get(uploadDir, "signed-orders");
        Files.createDirectories(uploadPath);
        
        String fileName = String.format("order-%d-signed-%d.pdf", orderId, System.currentTimeMillis());
        Path filePath = uploadPath.resolve(fileName);
        
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return filePath.toString();
    }

    private void processInventoryUpdates(Order order) {
        // Implementation for inventory management if needed
        log.info("Processing inventory updates for approved order: {}", order.getOrderId());
    }

    private boolean isWithinFirstWeek() {
        return LocalDateTime.now().getDayOfMonth() <= 7;
    }

    // ============================================================================
    // NOTIFICATION METHODS
    // ============================================================================

    private void sendOrderCreationNotifications(Order order) {
        try {
            emailService.sendOrderNotificationToAdmin(mapToOrderDetailDTO(order));
            notificationService.sendToAdmins("New Order Created", 
                String.format("New order #%s created by %s", 
                    order.getOrderNumber(), order.getCreatedBy().getUsername()));
        } catch (Exception e) {
            log.warn("Failed to send order creation notifications", e);
        }
    }

    private void sendOrderExportNotifications(Order order) {
        try {
            notificationService.sendToAdmins("Order PDF Exported", 
                String.format("Order #%s PDF has been exported", order.getOrderNumber()));
        } catch (Exception e) {
            log.warn("Failed to send order export notifications", e);
        }
    }

    private void sendOrderSubmissionNotifications(Order order) {
        try {
            emailService.sendOrderSubmissionNotification(order);
            notificationService.sendToAdmins("Order Submitted for Approval", 
                String.format("Order #%s has been submitted with signed PDF", order.getOrderNumber()));
        } catch (Exception e) {
            log.warn("Failed to send order submission notifications", e);
        }
    }

    private void sendOrderApprovalNotifications(Order order) {
        try {
            emailService.sendOrderApprovalNotification(order);
            notificationService.sendToUser(order.getCreatedBy().getUserId(), 
                order.getCreatedBy().getUsername(),
                "Order Approved", 
                String.format("Your order #%s has been approved", order.getOrderNumber()),
                "/order-history");
        } catch (Exception e) {
            log.warn("Failed to send order approval notifications", e);
        }
    }

    private void sendOrderRejectionNotifications(Order order, String reason) {
        try {
            emailService.sendOrderRejectionNotification(order, reason);
            notificationService.sendToUser(order.getCreatedBy().getUserId(),
                order.getCreatedBy().getUsername(),
                "Order Rejected",
                String.format("Your order #%s has been rejected. Reason: %s", order.getOrderNumber(), reason),
                "/order-history");
        } catch (Exception e) {
            log.warn("Failed to send order rejection notifications", e);
        }
    }

    // ============================================================================
    // MAPPING METHODS
    // ============================================================================

    private OrderDetailDTO mapToOrderDetailDTO(Order order) {
        OrderDetailDTO dto = new OrderDetailDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setStatus(order.getStatus());
        dto.setStatusDisplayName(order.getStatus().getDisplayName());
        dto.setProgressPercentage(order.getStatus().getProgressPercentage());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setAdminComment(order.getAdminComment());
        dto.setSignedPdfPath(order.getSignedPdfPath());
        
        // Map department
        if (order.getDepartment() != null) {
            DepartmentDTO deptDTO = new DepartmentDTO();
            deptDTO.setDepartmentId(order.getDepartment().getDepartmentId());
            deptDTO.setName(order.getDepartment().getName());
            deptDTO.setEmail(order.getDepartment().getEmail());
            dto.setDepartment(deptDTO);
        }
        
        // Map created by user
        if (order.getCreatedBy() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(order.getCreatedBy().getUserId());
            userDTO.setUsername(order.getCreatedBy().getUsername());
            userDTO.setEmail(order.getCreatedBy().getEmail());
            dto.setCreatedBy(userDTO);
        }
        
        // Map approved by user
        if (order.getApprovedBy() != null) {
            UserDTO approvedByDTO = new UserDTO();
            approvedByDTO.setId(order.getApprovedBy().getUserId());
            approvedByDTO.setUsername(order.getApprovedBy().getUsername());
            dto.setApprovedBy(approvedByDTO);
        }
        
        // Map order items
        if (order.getItems() != null) {
            List<OrderItemDetailDTO> itemDTOs = order.getItems().stream()
                .map(this::mapToOrderItemDetailDTO)
                .toList();
            dto.setItems(itemDTOs);
        }
        
        return dto;
    }

    private OrderSummaryDTO mapToOrderSummaryDTO(Order order) {
        OrderSummaryDTO dto = new OrderSummaryDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setStatus(order.getStatus());
        dto.setStatusDisplayName(order.getStatus().getDisplayName());
        dto.setProgressPercentage(order.getStatus().getProgressPercentage());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setItemCount(order.getItems() != null ? order.getItems().size() : 0);
        
        if (order.getDepartment() != null) {
            dto.setDepartmentName(order.getDepartment().getName());
        }
        
        return dto;
    }

    private OrderItemDetailDTO mapToOrderItemDetailDTO(OrderItem orderItem) {
        OrderItemDetailDTO dto = new OrderItemDetailDTO();
        dto.setOrderItemId(orderItem.getOrderItemId());
        dto.setQuantity(orderItem.getQuantity());
        
        if (orderItem.getProduct() != null) {
            Product product = orderItem.getProduct();
            dto.setProductId(product.getProductId());
            dto.setProductName(product.getName());
            dto.setProductCode(product.getCode());
            dto.setProductImage(product.getImage());
            
            if (product.getUnit() != null) {
                dto.setUnitNameVn(product.getUnit().getNameVn());
                dto.setUnitNameEn(product.getUnit().getNameEn());
            }
        }
        
        return dto;
    }
}

// ============================================================================
// 2. ENHANCED API RESPONSE WRAPPER
// ============================================================================

package com.example.stationerymgntbe.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Map<String, Object> metadata;
    private List<String> errors;
    private LocalDateTime timestamp;
    private String requestId;

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    public static <T> ApiResponse<T> success(String message, T data, Map<String, Object> metadata) {
        ApiResponse<T> response = success(message, data);
        response.setMetadata(metadata);
        return response;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        ApiResponse<T> response = error(message);
        response.setErrors(errors);
        return response;
    }
}

// ============================================================================
// 3. ENHANCED DTOs
// ============================================================================

package com.example.stationerymgntbe.dto;

import com.example.stationerymgntbe.enums.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDetailDTO {
    private Integer orderId;
    private String orderNumber;
    private DepartmentDTO department;
    private UserDTO createdBy;
    private UserDTO approvedBy;
    private OrderStatus status;
    private String statusDisplayName;
    private Integer progressPercentage;
    private List<OrderItemDetailDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String adminComment;
    private String signedPdfPath;
    private OrderMetadataDTO metadata;
}

@Data
public class OrderSummaryDTO {
    private Integer orderId;
    private String orderNumber;
    private String departmentName;
    private OrderStatus status;
    private String statusDisplayName;
    private Integer progressPercentage;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Data
public class OrderItemDetailDTO {
    private Integer orderItemId;
    private Integer productId;
    private String productName;
    private String productCode;
    private String productImage;
    private Integer quantity;
    private String unitNameVn;
    private String unitNameEn;
}

@Data
public class OrderMetadataDTO {
    private String createdByIp;
    private String userAgent;
    private String deviceInfo;
    private Map<String, Object> additionalInfo;
}

// ============================================================================
// 4. ENHANCED ORDER STATUS ENUM
// ============================================================================

package com.example.stationerymgntbe.enums;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("pending", "Order Created", 25, "Your order has been created and is ready for PDF export"),
    EXPORTED("exported", "PDF Exported", 50, "PDF has been exported. Please get it signed and upload back"),
    SUBMITTED("submitted", "Submitted for Approval", 75, "Signed PDF uploaded. Waiting for admin approval"),
    APPROVED("approved", "Approved", 100, "Your order has been approved and will be processed"),
    REJECTED("rejected", "Rejected", 100, "Your order has been rejected. Please check admin comments");

    private final String code;
    private final String displayName;
    private final int progressPercentage;
    private final String description;

    OrderStatus(String code, String displayName, int progressPercentage, String description) {
        this.code = code;
        this.displayName = displayName;
        this.progressPercentage = progressPercentage;
        this.description = description;
    }

    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this) {
            case PENDING -> newStatus == EXPORTED;
            case EXPORTED -> newStatus == SUBMITTED;
            case SUBMITTED -> newStatus == APPROVED || newStatus == REJECTED;
            case APPROVED, REJECTED -> false;
        };
    }
}

// ============================================================================
// 5. EXCEPTION CLASSES
// ============================================================================

package com.example.stationerymgntbe.exception;

public class InvalidOrderStateException extends RuntimeException {
    public InvalidOrderStateException(String message) {
        super(message);
    }
    
    public InvalidOrderStateException(String message, Throwable cause) {
        super(message, cause);
    }
}

// ============================================================================
// 6. AUDIT SERVICE
// ============================================================================

package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {
    
    public void logOrderCreation(Order order, User user) {
        log.info("AUDIT: Order created - OrderId: {}, User: {}, Department: {}", 
            order.getOrderId(), user.getUsername(), order.getDepartment().getName());
    }
    
    public void logOrderStatusChange(Order order, OrderStatus oldStatus, OrderStatus newStatus, 
                                   User user, String reason) {
        log.info("AUDIT: Order status changed - OrderId: {}, From: {}, To: {}, User: {}, Reason: {}", 
            order.getOrderId(), oldStatus, newStatus, user.getUsername(), reason);
    }
    
    public void logOrderApproval(Order order, User admin, String comment) {
        log.info("AUDIT: Order approved - OrderId: {}, Admin: {}, Comment: {}", 
            order.getOrderId(), admin.getUsername(), comment);
    }
    
    public void logOrderRejection(Order order, User admin, String reason) {
        log.info("AUDIT: Order rejected - OrderId: {}, Admin: {}, Reason: {}", 
            order.getOrderId(), admin.getUsername(), reason);
    }
}