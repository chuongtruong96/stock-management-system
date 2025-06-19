package com.example.stationerymgntbe.dto;
import java.util.List;

import lombok.Data;
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
