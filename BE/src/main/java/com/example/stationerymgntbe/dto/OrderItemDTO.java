// src/main/java/com/example/stationerymgntbe/dto/OrderItemDTO.java
package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Integer orderItemId;
    private Integer orderId;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private String unitNameVn;
    private String unitNameEn;
}