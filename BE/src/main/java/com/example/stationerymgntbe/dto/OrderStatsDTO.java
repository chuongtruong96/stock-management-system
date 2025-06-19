package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsDTO {
    private Long totalOrders;
    private Long pendingOrders;
    private Long approvedOrders;
    private String month;
    
    // Constructor for Map conversion
    public static OrderStatsDTO fromMap(Map<String, Object> map) {
        OrderStatsDTO dto = new OrderStatsDTO();
        dto.setTotalOrders(((Number) map.get("totalOrders")).longValue());
        dto.setPendingOrders(((Number) map.get("pendingOrders")).longValue());
        dto.setApprovedOrders(((Number) map.get("approvedOrders")).longValue());
        dto.setMonth((String) map.get("month"));
        return dto;
    }
}