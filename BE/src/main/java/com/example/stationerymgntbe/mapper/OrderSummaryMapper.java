package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.OrderSummaryDTO;
import com.example.stationerymgntbe.entity.OrderSummary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderSummaryMapper {
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "orderNumber", ignore = true)
    @Mapping(target = "departmentName", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "statusDisplayName", ignore = true)
    @Mapping(target = "progressPercentage", ignore = true)
    @Mapping(target = "itemCount", ignore = true)
    @Mapping(target = "adminComment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    OrderSummaryDTO toDto(OrderSummary s);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "departmentId", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "totalOrders", ignore = true)
    @Mapping(target = "approvedCount", ignore = true)
    @Mapping(target = "rejectedCount", ignore = true)
    @Mapping(target = "pendingCount", ignore = true)
    OrderSummary toEntity(OrderSummaryDTO dto);
}