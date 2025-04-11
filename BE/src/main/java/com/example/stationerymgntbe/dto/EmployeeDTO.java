// src/main/java/com/example/stationerymgntbe/dto/EmployeeDTO.java
package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class EmployeeDTO {
    private Integer employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private DepartmentDTO department;
    private String position;

    public EmployeeDTO(Integer employeeId, String firstName, String lastName, String email, DepartmentDTO department, String position) {
        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.position = position;
    }
}