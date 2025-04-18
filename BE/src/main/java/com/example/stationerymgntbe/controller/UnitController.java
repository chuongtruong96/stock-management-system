// src/main/java/com/example/stationerymgntbe/controller/UnitController.java
package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.UnitDTO;
import com.example.stationerymgntbe.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UnitDTO>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnitDTO> addUnit(@RequestBody UnitDTO unitDTO) {
        return ResponseEntity.ok(unitService.addUnit(unitDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnitDTO> updateUnit(@PathVariable Integer id, @RequestBody UnitDTO unitDTO) {
        return ResponseEntity.ok(unitService.updateUnit(id, unitDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUnit(@PathVariable Integer id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok("Unit deleted successfully");
    }
}