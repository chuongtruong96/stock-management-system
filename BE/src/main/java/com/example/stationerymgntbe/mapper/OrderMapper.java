// src/main/java/com/example/stationerymgntbe/mapper/OrderMapper.java
package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mappings({
            @Mapping(source = "department.departmentId", target = "departmentId"),
            @Mapping(source = "approvedBy.username", target = "approvedByUsername")
    })
    OrderDTO toOrderDTO(Order order);
}