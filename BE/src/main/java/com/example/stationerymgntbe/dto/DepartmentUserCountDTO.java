package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentUserCountDTO {
    private Integer departmentId;
    private String departmentName;
    private Long userCount;

    // Constructor for backward compatibility
    public DepartmentUserCountDTO(String departmentName, Long userCount) {
        this.departmentId = null;
        this.departmentName = departmentName;
        this.userCount = userCount;
    }

    // Constructor for long compatibility
    public DepartmentUserCountDTO(String departmentName, long userCount) {
        this.departmentId = null;
        this.departmentName = departmentName;
        this.userCount = (long) userCount;
    }
}
