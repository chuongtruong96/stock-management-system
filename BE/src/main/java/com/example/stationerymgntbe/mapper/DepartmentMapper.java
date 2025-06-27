package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.*;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    DepartmentDTO toDto(Department entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Department toEntity(DepartmentDTO dto);
    
    @IterableMapping(elementTargetType = DepartmentDTO.class)
    List<DepartmentDTO> toDtoList(List<Department> entities);
}