package com.example.stationerymgntbe.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.stationerymgntbe.dto.UnitDTO;
import com.example.stationerymgntbe.entity.Unit;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    @Mapping(source = "unitId", target = "id")
    UnitDTO toDto(Unit unit);
    
    @Mapping(target = "unitId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Unit toEntity(UnitDTO dto);
    
    List<UnitDTO> toDtoList(List<Unit> units);
}
