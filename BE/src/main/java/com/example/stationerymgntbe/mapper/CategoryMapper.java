package com.example.stationerymgntbe.mapper;

import org.mapstruct.Mapper;

import com.example.stationerymgntbe.dto.CategoryDTO;
import com.example.stationerymgntbe.entity.Category;

// src/main/java/.../mapper/CategoryMapper.java
@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDTO toDto(Category c);
    Category    toEntity(CategoryDTO d);
}
