package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.DepartmentDTO;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDepartmentDTO)
                .collect(Collectors.toList());
    }

    private DepartmentDTO toDepartmentDTO(Department department) {
        return new DepartmentDTO(
                department.getDepartmentId(),
                department.getName(),
                department.getResponsiblePerson(),
                department.getEmail()
        );
    }
}