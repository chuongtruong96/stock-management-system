package com.example.stationerymgntbe.dto;

import lombok.Data;
// src/main/java/.../dto/CategoryDTO.java
@Data
public class CategoryDTO {
    private Integer categoryId;
    private String  nameVn;
    private String  nameEn;
    private String  code;   // giữ nguyên để FE tra cứu
    private String  icon;   // tên file
    private Long productCount;  
}
