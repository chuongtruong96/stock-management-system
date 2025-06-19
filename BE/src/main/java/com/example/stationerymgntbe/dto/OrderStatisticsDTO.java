package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatisticsDTO {
    private Long totalOrders;
    private Long pendingOrders;
    private Long approvedOrders;
    private Long rejectedOrders;
    private Long submittedOrders;
    private Double completionRate;
    private Map<String, Long> statusDistribution;
    private List<MonthlyOrderSummaryDTO> monthlyTrends;
    private Map<String, Object> additionalMetrics;
}