package com.example.stationerymgntbe.dto;

import com.example.stationerymgntbe.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class OrderSummaryDTO {
    private Integer orderId;
    private String orderNumber;
    private String departmentName;
    private String createdBy;
    private OrderStatus status;
    private String statusDisplayName;
    private Integer progressPercentage;
    private Integer itemCount;
    private String adminComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}