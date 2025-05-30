// src/main/java/com/example/stationerymgntbe/repository/UnitRepository.java
package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Unit;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitRepository extends JpaRepository<Unit, Integer> {
    Optional<Unit> findByNameVnIgnoreCase(String nameVn);
    Optional<Unit> findByNameEnIgnoreCase(String nameEn);

}