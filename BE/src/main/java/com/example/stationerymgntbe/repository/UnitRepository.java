// src/main/java/com/example/stationerymgntbe/repository/UnitRepository.java
package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Unit;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitRepository extends JpaRepository<Unit, Integer> {
    Optional<Unit> findByNameVn(String nameVn);
    Optional<Unit> findByNameEn(String nameEn);
}