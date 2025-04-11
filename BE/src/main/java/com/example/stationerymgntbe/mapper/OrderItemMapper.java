package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(source = "order.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId", defaultValue = "0")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "product.unit.nameVn", target = "unitNameVn")
    @Mapping(source = "product.unit.nameEn", target = "unitNameEn")
    OrderItemDTO toOrderItemDTO(OrderItem orderItem);
}