// src/main/java/com/example/stationerymgntbe/dto/UserResponseDTO.java
package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Integer id;
    private String username;
    private String role;
    // private DepartmentDTO department;
    /* thêm trường phẳng */
    private Integer departmentId;
    private String departmentName;
    private String departmentEmail;
}