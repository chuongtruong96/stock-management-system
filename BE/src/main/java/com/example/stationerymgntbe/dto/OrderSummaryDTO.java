package com.example.stationerymgntbe.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryDTO {
    private Long id;
    private Integer departmentId;
    private LocalDate date;
    private Integer totalOrders;
    private Integer approvedCount;
    private Integer rejectedCount;
    private Integer pendingCount;
}