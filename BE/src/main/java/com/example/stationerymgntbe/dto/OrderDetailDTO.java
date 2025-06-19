package com.example.stationerymgntbe.dto;

import com.example.stationerymgntbe.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class OrderDetailDTO {
    private Integer orderId;
    private String orderNumber;
    private DepartmentDTO department;
    private UserDTO createdBy;
    private UserDTO approvedBy;
    private OrderStatus status;
    private String statusDisplayName;
    private Integer progressPercentage;
    private List<OrderItemDetailDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String adminComment;
    private String signedPdfPath;
    private OrderMetadataDTO metadata;
}
