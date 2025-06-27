package com.example.stationerymgntbe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.stationerymgntbe.dto.CategoryDTO;
import com.example.stationerymgntbe.entity.Category;

// src/main/java/.../mapper/CategoryMapper.java
@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "productCount", ignore = true)
    CategoryDTO toDto(Category c);
    
    Category toEntity(CategoryDTO d);
}
