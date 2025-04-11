package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
}