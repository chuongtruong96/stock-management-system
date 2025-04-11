package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class OrderItemInput {
    private Integer productId;
    private Integer quantity;
}