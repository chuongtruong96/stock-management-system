package com.example.stationerymgntbe.dto;

import lombok.Data;
@Data
public class ProductDTO {
    private Integer id;
    private String code;
    private String name;
    private String unit;
    private Integer stock;
    private Double price;
}