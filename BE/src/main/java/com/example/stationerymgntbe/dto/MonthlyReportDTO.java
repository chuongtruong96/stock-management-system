// src/main/java/com/example/stationerymgntbe/dto/MonthlyReportDTO.java
package com.example.stationerymgntbe.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlyReportDTO {

    private List<OrderDTO> orders;

    private List<ReportDTO> summary;

    private List<ChartSeriesDTO> chart;
}
