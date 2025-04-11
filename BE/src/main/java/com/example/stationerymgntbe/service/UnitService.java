package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.UnitDTO;
import com.example.stationerymgntbe.entity.Unit;
import com.example.stationerymgntbe.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    public List<UnitDTO> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::toUnitDTO)
                .collect(Collectors.toList());
    }

    public UnitDTO addUnit(UnitDTO unitDTO) {
        Unit unit = new Unit();
        unit.setNameEn(unitDTO.getNameEn());
        unit.setNameVn(unitDTO.getNameVn());
        unit = unitRepository.save(unit);
        return toUnitDTO(unit);
    }

    public UnitDTO updateUnit(Integer id, UnitDTO unitDTO) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found: " + id));
        unit.setNameEn(unitDTO.getNameEn());
        unit.setNameVn(unitDTO.getNameVn());
        unit = unitRepository.save(unit);
        return toUnitDTO(unit);
    }

    public void deleteUnit(Integer id) {
        unitRepository.deleteById(id);
    }

    private UnitDTO toUnitDTO(Unit unit) {
        return new UnitDTO(unit.getUnitId(), unit.getNameEn(), unit.getNameVn());
    }
}