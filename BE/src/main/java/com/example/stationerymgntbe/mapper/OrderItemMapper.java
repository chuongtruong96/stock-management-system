// src/main/java/com/example/stationerymgntbe/mapper/OrderItemMapper.java
package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {

    @Mapping(source = "order.orderId", target = "orderId")
    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.unit.nameVn", target = "unitNameVn")
    @Mapping(source = "product.unit.nameEn", target = "unitNameEn")
    OrderItemDTO toOrderItemDTO(OrderItem orderItem);
}
