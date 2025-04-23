package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.OrderSummaryDTO;
import com.example.stationerymgntbe.entity.OrderSummary;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderSummaryMapper {
    OrderSummaryDTO toDto(OrderSummary s);
    OrderSummary toEntity(OrderSummaryDTO dto);
}