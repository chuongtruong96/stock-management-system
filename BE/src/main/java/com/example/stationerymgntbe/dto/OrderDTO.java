package com.example.stationerymgntbe.dto;

import com.example.stationerymgntbe.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
public class OrderDTO {
    private Integer orderId;
    private Integer departmentId;
    // private String departmentName;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String adminComment;
    private String approvedByUsername;
}