package com.example.stationerymgntbe.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.example.stationerymgntbe.dto.UnitDTO;
import com.example.stationerymgntbe.entity.Unit;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    UnitDTO toDto(Unit unit);
    Unit toEntity(UnitDTO dto);
    List<UnitDTO> toDtoList(List<Unit> units);
}
