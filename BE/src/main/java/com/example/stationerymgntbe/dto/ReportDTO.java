package com.example.stationerymgntbe.dto;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReportDTO {
    private Long id;
    private String department;
    private String productCode;
    private String productNameVn;
    private int quantity;
    private String unit;
}
