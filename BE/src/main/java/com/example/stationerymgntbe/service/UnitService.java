// src/main/java/com/example/stationerymgntbe/service/UnitService.java
package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.UnitDTO;
import com.example.stationerymgntbe.entity.Unit;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    public List<UnitDTO> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::toUnitDTO)
                .collect(Collectors.toList());
    }

    public UnitDTO addUnit(UnitDTO dto) {
        Unit unit = new Unit();
        unit.setNameEn(dto.getNameEn());
        unit.setNameVn(dto.getNameVn());
        return toUnitDTO(unitRepository.save(unit));
    }

    public UnitDTO updateUnit(Integer id, UnitDTO dto) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with ID: " + id));
        unit.setNameEn(dto.getNameEn());
        unit.setNameVn(dto.getNameVn());
        return toUnitDTO(unitRepository.save(unit));
    }

    public void deleteUnit(Integer id) {
        if (!unitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Unit not found with ID: " + id);
        }
        unitRepository.deleteById(id);
    }

    private UnitDTO toUnitDTO(Unit unit) {
        return new UnitDTO(unit.getUnitId(), unit.getNameEn(), unit.getNameVn());
    }
}
