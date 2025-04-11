package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
}