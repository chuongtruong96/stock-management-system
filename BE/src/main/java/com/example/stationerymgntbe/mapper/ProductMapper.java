package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "productId", target = "productId")
    @Mapping(source = "code", target = "code")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "unit.nameVn", target = "unit")  // Map Unit's nameVn to ProductDTO's unit field
    @Mapping(source = "stock", target = "stock")
    @Mapping(source = "price", target = "price")
    ProductDTO toProductDTO(Product product);
}