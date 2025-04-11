package com.example.stationerymgntbe.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderInput {
    private List<OrderItemInput> items;
}