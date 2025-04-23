package com.example.stationerymgntbe.dto;
import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class OrderStatusDTO {
    private Integer orderId;
    private String  status;      // pending / approved / rejected
    private Integer departmentId;
    private String  department;  // optional
}
