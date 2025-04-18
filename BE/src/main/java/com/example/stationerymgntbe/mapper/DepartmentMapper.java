package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.*;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    DepartmentDTO toDto(Department entity);
    Department toEntity(DepartmentDTO dto);
    List<DepartmentDTO> toDtoList(List<Department> entities);
}