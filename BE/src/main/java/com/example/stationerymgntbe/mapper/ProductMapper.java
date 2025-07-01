// src/main/java/com/example/stationerymgntbe/mapper/ProductMapper.java
package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    
    @Mapping(source = "productId", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "nameEn", target = "nameEn")
    @Mapping(source = "code", target = "code")
    @Mapping(source = "image", target = "image")
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "categoryName", ignore = true)
    @Mapping(target = "unitId", ignore = true)
    @Mapping(target = "unit", ignore = true)
    ProductDTO toDto(Product product);

    @AfterMapping
    default void setCategoryAndUnit(@MappingTarget ProductDTO dto, Product product) {
        // Set categoryId and categoryName safely
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
            String categoryName = product.getCategory().getNameVn();
            if (categoryName == null || categoryName.trim().isEmpty()) {
                categoryName = product.getCategory().getNameEn();
            }
            if (categoryName == null || categoryName.trim().isEmpty()) {
                categoryName = "Uncategorized";
            }
            dto.setCategoryName(categoryName);
        } else {
            dto.setCategoryName("Uncategorized");
        }
        
        // Set unitId and unit name safely
        if (product.getUnit() != null) {
            dto.setUnitId(product.getUnit().getUnitId());
            String unitName = product.getUnit().getNameVn();
            if (unitName == null || unitName.trim().isEmpty()) {
                unitName = product.getUnit().getNameEn();
            }
            if (unitName == null || unitName.trim().isEmpty()) {
                unitName = "Unknown Unit";
            }
            dto.setUnit(unitName);
        } else {
            dto.setUnit("Unknown Unit");
        }
    }

    @Mapping(target = "unit", ignore = true) // manually set in service
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(source = "name", target = "name")
    @Mapping(source = "nameEn", target = "nameEn")
    @Mapping(source = "code", target = "code")
    @Mapping(source = "image", target = "image")
    Product toEntity(ProductDTO dto);
}