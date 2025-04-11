// src/main/java/com/example/stationerymgntbe/dto/UnitDTO.java
package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class UnitDTO {
    private Integer id;
    private String nameEn;
    private String nameVn;

    public UnitDTO(Integer id, String nameEn, String nameVn) {
        this.id = id;
        this.nameEn = nameEn;
        this.nameVn = nameVn;
    }
}