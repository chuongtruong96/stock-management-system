package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyOrderSummaryDTO {
    private Long totalOrders;
    private String period;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    // Constructor for Map conversion
    public static MonthlyOrderSummaryDTO fromMap(Map<String, Object> map) {
        MonthlyOrderSummaryDTO dto = new MonthlyOrderSummaryDTO();
        dto.setTotalOrders(((Number) map.get("totalOrders")).longValue());
        dto.setPeriod((String) map.get("period"));
        dto.setStartDate((LocalDateTime) map.get("startDate"));
        dto.setEndDate((LocalDateTime) map.get("endDate"));
        return dto;
    }
}