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
    public OrderItemDTO(Integer orderItemId, Integer orderId, Integer productId, String productName, Integer quantity, String unitNameVn,String unitNameEn) {
        this.orderItemId = orderItemId;
        this.orderId = orderId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitNameVn = unitNameVn;
        this.unitNameEn = unitNameEn;
    }
}