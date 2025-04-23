package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department,Integer> {

    /** tìm kiếm theo email của phòng ban */
    Optional<Department> findByEmail(String email);
}
