package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class OrderItemDetailDTO {
    private Integer orderItemId;
    private Integer productId;
    private String productName;
    private String productCode;
    private String productImage;
    private Integer quantity;
    private String unitNameVn;
    private String unitNameEn;
}