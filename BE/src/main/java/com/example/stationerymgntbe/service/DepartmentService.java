package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.DepartmentDTO;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
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

    public Department getById(Integer departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + departmentId));
    }

    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        Department department = new Department();
        department.setName(dto.getName());
        department.setEmail(dto.getEmail());
        return toDepartmentDTO(departmentRepository.save(department));
    }

    public DepartmentDTO updateDepartment(Integer id, DepartmentDTO dto) {
        Department department = getById(id);
        department.setName(dto.getName());
        department.setEmail(dto.getEmail());
        return toDepartmentDTO(departmentRepository.save(department));
    }

    public void deleteDepartment(Integer id) {
        Department department = getById(id);
        departmentRepository.delete(department);
    }

    private DepartmentDTO toDepartmentDTO(Department department) {
        return new DepartmentDTO(
                department.getDepartmentId(),
                department.getName(),
                department.getEmail()
        );
    }
}
