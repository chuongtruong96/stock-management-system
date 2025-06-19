package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminWorkflowStatsDTO {
    private Long pendingApproval;
    private Long totalProcessed;
    private Long rejectedOrders;
    
    // Constructor for Map conversion
    public static AdminWorkflowStatsDTO fromMap(Map<String, Object> map) {
        AdminWorkflowStatsDTO dto = new AdminWorkflowStatsDTO();
        dto.setPendingApproval(((Number) map.get("pendingApproval")).longValue());
        dto.setTotalProcessed(((Number) map.get("totalProcessed")).longValue());
        dto.setRejectedOrders(((Number) map.get("rejectedOrders")).longValue());
        return dto;
    }
}