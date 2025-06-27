package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.enums.UserRole;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import com.example.stationerymgntbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    // ============================================================================
    // CURRENT USER METHODS
    // ============================================================================

    @Transactional
    public UserDetailDTO getCurrentUserDetailInfo() {
        User currentUser = getCurrentUserEntity();
        return mapToUserDetailDTO(currentUser);
    }

    @Transactional
    public UserProfileDTO getCurrentUserProfile() {
        User currentUser = getCurrentUserEntity();
        return mapToUserProfileDTO(currentUser);
    }

    @Transactional
    public User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return userRepository.findByUsernameWithDepartmentAndRole(username)
            .orElseThrow(() -> new ResourceNotFoundException("Current user not found: " + username));
    }

    @Transactional
    public UserDTO getCurrentUser() {
        User user = getCurrentUserEntity();
        return mapToUserDTO(user);
    }

    // ============================================================================
    // USER MANAGEMENT METHODS
    // ============================================================================

    @Transactional
    public List<UserSummaryDTO> getAllUsersSummary() {
        return userRepository.findAllWithDepartmentAndRole().stream()
            .map(this::mapToUserSummaryDTO)
            .collect(Collectors.toList());
    }

    @Transactional
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
        
        UserRole role = UserRole.valueOf(roleName.toUpperCase());
        
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        log.info("User role updated - User: {}, Role: {}", 
            savedUser.getUsername(), role.name());
        
        return mapToUserDetailDTO(savedUser);
    }

    // ============================================================================
    // STATISTICS METHODS
    // ============================================================================

    public UserStatisticsDTO getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
            .filter(User::isActive)
            .count();
        long adminUsers = userRepository.findAll().stream()
            .filter(user -> user.getRole() == UserRole.ADMIN)
            .count();
        long regularUsers = userRepository.findAll().stream()
            .filter(user -> user.getRole() == UserRole.USER)
            .count();
        
        List<DepartmentUserCountDTO> departmentCounts = departmentRepository.findAll().stream()
            .map(dept -> {
                long count = userRepository.countByDepartment(dept);
                return new DepartmentUserCountDTO(dept.getDepartmentId(), dept.getName(), count);
            })
            .collect(Collectors.toList());
        
        return new UserStatisticsDTO(totalUsers, activeUsers, adminUsers, regularUsers, departmentCounts);
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    public List<String> getAdminUsernames() {
        return userRepository.findAll().stream()
            .filter(user -> user.getRole() == UserRole.ADMIN)
            .map(User::getUsername)
            .collect(Collectors.toList());
    }

    // ============================================================================
    // MISSING METHODS FOR DASHBOARD AND AUTH
    // ============================================================================

    @Transactional
    public void updatePassword(User user, String newPassword, PasswordEncoder passwordEncoder) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Password updated for user: {}", user.getUsername());
    }

    public List<DepartmentUserCountDTO> getDepartmentStats() {
        return departmentRepository.findAll().stream()
            .map(dept -> {
                long count = userRepository.countByDepartment(dept);
                return new DepartmentUserCountDTO(dept.getDepartmentId(), dept.getName(), count);
            })
            .collect(Collectors.toList());
    }

    public List<UserSummaryDTO> getAllUsers() {
        return getAllUsersSummary();
    }

    public List<DepartmentUserCountDTO> getDepartmentsPendingOrders() {
        // This method should return departments with pending orders
        // For now, return department stats as placeholder
        return getDepartmentStats();
    }

    // ============================================================================
    // MAPPING METHODS
    // ============================================================================

    private UserDetailDTO mapToUserDetailDTO(User user) {
        UserDetailDTO dto = new UserDetailDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
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
            roleDTO.setId(user.getRole().ordinal());
            roleDTO.setName(user.getRole().name());
            roleDTO.setDescription(user.getRole().name() + " Role");
            dto.setRole(roleDTO);
        }
        
        return dto;
    }

    private UserProfileDTO mapToUserProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        
        if (user.getDepartment() != null) {
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().name());
        }
        
        return dto;
    }

    private UserSummaryDTO mapToUserSummaryDTO(User user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setActive(user.isActive());
        
        if (user.getDepartment() != null) {
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().name());
        }
        
        return dto;
    }

    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setActive(user.isActive());
        
        if (user.getDepartment() != null) {
            dto.setDepartmentId(user.getDepartment().getDepartmentId());
            dto.setDepartmentName(user.getDepartment().getName());
        }
        
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().name());
        }
        
        return dto;
    }
}