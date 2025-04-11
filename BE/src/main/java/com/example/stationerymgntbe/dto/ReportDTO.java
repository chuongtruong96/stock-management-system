package com.example.stationerymgntbe.dto;

import lombok.Data;

@Data
public class ReportDTO {
    private String department;
    private String productCode;
    private String productNameVn;
    private int quantity;
    private String unit;
}
