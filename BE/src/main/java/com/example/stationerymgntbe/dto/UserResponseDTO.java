// src/main/java/com/example/stationerymgntbe/dto/UserResponseDTO.java
package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Integer userId;
    private String username;
    private String role;
    private EmployeeDTO employee; // Replace employeeId with the full employee object

    public UserResponseDTO(Integer userId, String username, String role, EmployeeDTO employee) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.employee = employee;
    }
}