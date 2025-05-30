package com.example.stationerymgntbe.dto;

public record ProductOrderSummaryDTO(
    Integer productId,
    String productName,
    Long totalQuantity
) {}