// src/main/java/com/example/stationerymgntbe/dto/UnitDTO.java
package com.example.stationerymgntbe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitDTO {
    private Integer id;
    private String nameEn;
    private String nameVn;
}