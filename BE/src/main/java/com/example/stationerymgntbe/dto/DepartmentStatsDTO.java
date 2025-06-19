package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatsDTO {
    private Integer departmentId;
    private String departmentName;
    private Long totalUsers;
    private Long activeUsers;
    private Long pendingOrders;
    private Long completedOrders;

    // Constructor for basic stats
    public DepartmentStatsDTO(Integer departmentId, String departmentName, Long totalUsers, Long activeUsers) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.pendingOrders = 0L;
        this.completedOrders = 0L;
    }
}