// src/main/java/com/example/stationerymgntbe/mapper/ProductMapper.java
package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "unit", expression = "java(getUnitName(product))")
    @Mapping(source = "productId", target = "id")
    ProductDTO toDto(Product product);

    @Mapping(target = "unit", ignore = true) // manually set in service
    Product toEntity(ProductDTO dto);
    
    default String getUnitName(Product product) {
        try {
            return product.getUnit() != null ? product.getUnit().getNameVn() : "Unknown Unit";
        } catch (Exception e) {
            return "Unknown Unit";
        }
    }
}