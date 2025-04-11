// src/main/java/com/example/stationerymgntbe/dto/DepartmentDTO.java
package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class DepartmentDTO {
    private Integer departmentId;
    private String name;
    private String responsiblePerson;
    private String email;

    public DepartmentDTO(Integer departmentId, String name, String responsiblePerson, String email) {
        this.departmentId = departmentId;
        this.name = name;
        this.responsiblePerson = responsiblePerson;
        this.email = email;
    }
}