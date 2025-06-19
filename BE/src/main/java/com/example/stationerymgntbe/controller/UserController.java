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
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

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