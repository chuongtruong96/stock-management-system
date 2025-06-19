// Enhanced Controllers for Stationery Management System

// ============================================================================
// 1. ENHANCED ORDER CONTROLLER
// ============================================================================

package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.EnhancedOrderService;
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

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class EnhancedOrderController {

    private final EnhancedOrderService orderService;
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
            
            ByteArrayResource resource = orderService.getSignedPDF(id);
            
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
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkOrderPeriod() {
        try {
            Map<String, Boolean> result = orderService.checkOrderPeriod();
            
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
    public ResponseEntity<ApiResponse<OrderStatisticsDTO>> getOrderStatistics() {
        try {
            OrderStatisticsDTO statistics = orderService.getOrderStatistics();
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
            ApiResponse<Page<OrderSummaryDTO>> response = orderService.getMonthlyReport(month, year, pageable);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating monthly report for {}/{}", month, year, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate monthly report: " + e.getMessage()));
        }
    }
}

// ============================================================================
// 2. ENHANCED USER CONTROLLER
// ============================================================================

package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class EnhancedUserController {

    private final UserService userService;

    // ============================================================================
    // USER INFORMATION ENDPOINTS
    // ============================================================================

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDetailDTO>> getCurrentUserInfo(Principal principal) {
        try {
            log.info("Retrieving user info for: {}", principal.getName());
            
            UserDetailDTO userInfo = userService.getCurrentUserDetailInfo();
            
            return ResponseEntity.ok(ApiResponse.success("User information retrieved successfully", userInfo));
            
        } catch (Exception e) {
            log.error("Error retrieving user info for: {}", principal.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve user information: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfile() {
        try {
            UserProfileDTO profile = userService.getCurrentUserProfile();
            
            return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profile));
            
        } catch (Exception e) {
            log.error("Error retrieving user profile", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateUserProfile(
            @RequestBody UserProfileUpdateDTO updateDTO) {
        try {
            UserProfileDTO updatedProfile = userService.updateUserProfile(updateDTO);
            
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedProfile));
            
        } catch (Exception e) {
            log.error("Error updating user profile", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    // ============================================================================
    // ADMIN USER MANAGEMENT
    // ============================================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getAllUsers() {
        try {
            List<UserSummaryDTO> users = userService.getAllUsersSummary();
            
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
            
        } catch (Exception e) {
            log.error("Error retrieving all users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> getUserById(@PathVariable Integer id) {
        try {
            UserDetailDTO user = userService.getUserDetailById(id);
            
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
            
        } catch (Exception e) {
            log.error("Error retrieving user by ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("User not found: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> updateUserDepartment(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        try {
            Integer departmentId = body.get("departmentId");
            UserDetailDTO updatedUser = userService.updateUserDepartment(id, departmentId);
            
            return ResponseEntity.ok(ApiResponse.success("User department updated successfully", updatedUser));
            
        } catch (Exception e) {
            log.error("Error updating user department for user: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to update user department: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> updateUserRole(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        try {
            String roleName = body.get("roleName");
            UserDetailDTO updatedUser = userService.updateUserRole(id, roleName);
            
            return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updatedUser));
            
        } catch (Exception e) {
            log.error("Error updating user role for user: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to update user role: " + e.getMessage()));
        }
    }

    // ============================================================================
    // USER STATISTICS
    // ============================================================================

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserStatisticsDTO>> getUserStatistics() {
        try {
            UserStatisticsDTO statistics = userService.getUserStatistics();
            
            return ResponseEntity.ok(ApiResponse.success("User statistics retrieved successfully", statistics));
            
        } catch (Exception e) {
            log.error("Error retrieving user statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve user statistics: " + e.getMessage()));
        }
    }
}

// ============================================================================
// 3. ENHANCED USER SERVICE
// ============================================================================

package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.entity.Role;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import com.example.stationerymgntbe.repository.RoleRepository;
import com.example.stationerymgntbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnhancedUserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;

    // ============================================================================
    // CURRENT USER METHODS
    // ============================================================================

    public UserDetailDTO getCurrentUserDetailInfo() {
        User currentUser = getCurrentUserEntity();
        return mapToUserDetailDTO(currentUser);
    }

    public UserProfileDTO getCurrentUserProfile() {
        User currentUser = getCurrentUserEntity();
        return mapToUserProfileDTO(currentUser);
    }

    public User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return userRepository.findByUsernameWithDepartmentAndRole(username)
            .orElseThrow(() -> new ResourceNotFoundException("Current user not found: " + username));
    }

    public UserDTO getCurrentUser() {
        User user = getCurrentUserEntity();
        return mapToUserDTO(user);
    }

    // ============================================================================
    // USER MANAGEMENT METHODS
    // ============================================================================

    public List<UserSummaryDTO> getAllUsersSummary() {
        return userRepository.findAllWithDepartmentAndRole().stream()
            .map(this::mapToUserSummaryDTO)
            .collect(Collectors.toList());
    }

    public UserDetailDTO getUserDetailById(Integer id) {
        User user = userRepository.findByIdWithDepartmentAndRole(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        
        return mapToUserDetailDTO(user);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(UserProfileUpdateDTO updateDTO) {
        User currentUser = getCurrentUserEntity();
        
        // Update allowed profile fields
        if (updateDTO.getEmail() != null && !updateDTO.getEmail().trim().isEmpty()) {
            currentUser.setEmail(updateDTO.getEmail().trim());
        }
        
        if (updateDTO.getFullName() != null && !updateDTO.getFullName().trim().isEmpty()) {
            currentUser.setFullName(updateDTO.getFullName().trim());
        }
        
        if (updateDTO.getPhoneNumber() != null) {
            currentUser.setPhoneNumber(updateDTO.getPhoneNumber().trim());
        }
        
        currentUser.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(currentUser);
        
        log.info("User profile updated for user: {}", savedUser.getUsername());
        return mapToUserProfileDTO(savedUser);
    }

    @Transactional
    public UserDetailDTO updateUserDepartment(Integer userId, Integer departmentId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + departmentId));
        
        user.setDepartment(department);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        log.info("User department updated - User: {}, Department: {}", 
            savedUser.getUsername(), department.getName());
        
        return mapToUserDetailDTO(savedUser);
    }

    @Transactional
    public UserDetailDTO updateUserRole(Integer userId, String roleName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        log.info("User role updated - User: {}, Role: {}", 
            savedUser.getUsername(), role.getName());
        
        return mapToUserDetailDTO(savedUser);
    }

    // ============================================================================
    // STATISTICS METHODS
    // ============================================================================

    public UserStatisticsDTO getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long adminUsers = userRepository.countByRoleName("ADMIN");
        long regularUsers = userRepository.countByRoleName("USER");
        
        List<DepartmentUserCountDTO> departmentCounts = userRepository.getDepartmentUserCounts();
        
        return new UserStatisticsDTO(totalUsers, activeUsers, adminUsers, regularUsers, departmentCounts);
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    public List<String> getAdminUsernames() {
        return userRepository.findUsernamesByRoleName("ADMIN");
    }

    // ============================================================================
    // MAPPING METHODS
    // ============================================================================

    private UserDetailDTO mapToUserDetailDTO(User user) {
        UserDetailDTO dto = new UserDetailDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        
        // Map department with enhanced information
        if (user.getDepartment() != null) {
            DepartmentDTO deptDTO = new DepartmentDTO();
            deptDTO.setDepartmentId(user.getDepartment().getDepartmentId());
            deptDTO.setName(user.getDepartment().getName());
            deptDTO.setEmail(user.getDepartment().getEmail());
            dto.setDepartment(deptDTO);
            
            // Set department name for backward compatibility
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        // Map role
        if (user.getRole() != null) {
            RoleDTO roleDTO = new RoleDTO();
            roleDTO.setId(user.getRole().getId());
            roleDTO.setName(user.getRole().getName());
            roleDTO.setDescription(user.getRole().getDescription());
            dto.setRole(roleDTO);
        }
        
        return dto;
    }

    private UserProfileDTO mapToUserProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        
        if (user.getDepartment() != null) {
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getName());
        }
        
        return dto;
    }

    private UserSummaryDTO mapToUserSummaryDTO(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setActive(user.isActive());
        
        if (user.getDepartment() != null) {
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getName());
        }
        
        return dto;
    }

    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        
        if (user.getDepartment() != null) {
            dto.setDepartmentId(user.getDepartment().getDepartmentId());
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        return dto;
    }
}

// ============================================================================
// 4. ENHANCED USER DTOs
// ============================================================================

package com.example.stationerymgntbe.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserDetailDTO {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private DepartmentDTO department;
    private String departmentName; // For backward compatibility
    private RoleDTO role;
}

@Data
public class UserProfileDTO {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String departmentName;
    private String roleName;
}

@Data
public class UserSummaryDTO {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private boolean active;
    private String departmentName;
    private String roleName;
}

@Data
public class UserProfileUpdateDTO {
    private String email;
    private String fullName;
    private String phoneNumber;
}

@Data
public class UserStatisticsDTO {
    private long totalUsers;
    private long activeUsers;
    private long adminUsers;
    private long regularUsers;
    private List<DepartmentUserCountDTO> departmentCounts;
    
    public UserStatisticsDTO(long totalUsers, long activeUsers, long adminUsers, 
                           long regularUsers, List<DepartmentUserCountDTO> departmentCounts) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.adminUsers = adminUsers;
        this.regularUsers = regularUsers;
        this.departmentCounts = departmentCounts;
    }
}

@Data
public class DepartmentUserCountDTO {
    private String departmentName;
    private long userCount;
    
    public DepartmentUserCountDTO(String departmentName, long userCount) {
        this.departmentName = departmentName;
        this.userCount = userCount;
    }
}

@Data
public class RoleDTO {
    private Integer id;
    private String name;
    private String description;
}

// ============================================================================
// 5. ENHANCED USER REPOSITORY
// ============================================================================

package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.dto.DepartmentUserCountDTO;
import com.example.stationerymgntbe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnhancedUserRepository extends JpaRepository<User, Integer> {

    // Enhanced user queries with proper joins
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department LEFT JOIN FETCH u.role WHERE u.username = :username")
    Optional<User> findByUsernameWithDepartmentAndRole(@Param("username") String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department LEFT JOIN FETCH u.role WHERE u.userId = :id")
    Optional<User> findByIdWithDepartmentAndRole(@Param("id") Integer id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department LEFT JOIN FETCH u.role ORDER BY u.username")
    List<User> findAllWithDepartmentAndRole();

    // Statistics queries
    long countByActiveTrue();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName")
    long countByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u.username FROM User u WHERE u.role.name = :roleName")
    List<String> findUsernamesByRoleName(@Param("roleName") String roleName);

    @Query("SELECT new com.example.stationerymgntbe.dto.DepartmentUserCountDTO(d.name, COUNT(u)) " +
           "FROM User u RIGHT JOIN u.department d " +
           "GROUP BY d.departmentId, d.name " +
           "ORDER BY COUNT(u) DESC")
    List<DepartmentUserCountDTO> getDepartmentUserCounts();
}