package com.example.stationerymgntbe.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDetailDTO {
    private Integer id;
    private String username;
    private String email;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private DepartmentDTO department;
    private String departmentName; // For backward compatibility
    private RoleDTO role;
}