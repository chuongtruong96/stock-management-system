package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private Integer id;
    private String code;
    private String name; // Vietnamese name - English translation via API when needed
    private String unit;
    private String image;
    private Integer categoryId;
    private Integer unitId;
}