package com.example.stationerymgntbe.dto;
import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class StockUpdateDTO {
    private Integer productId;
    private String  name;
    private Integer stock;
}
