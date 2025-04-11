package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.EmployeeDTO;
import com.example.stationerymgntbe.dto.DepartmentDTO;
import com.example.stationerymgntbe.entity.Employee;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.repository.EmployeeRepository;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toEmployeeDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        Department department = departmentRepository.findById(employeeDTO.getDepartment().getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        Employee employee = new Employee();
        employee.setFirstName(employeeDTO.getFirstName());
        employee.setLastName(employeeDTO.getLastName());
        employee.setEmail(employeeDTO.getEmail());
        employee.setDepartment(department);
        employee.setPosition(employeeDTO.getPosition());
        
        Employee savedEmployee = employeeRepository.save(employee);
        return toEmployeeDTO(savedEmployee);
    }

    public EmployeeDTO updateEmployee(Integer id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Department department = departmentRepository.findById(employeeDTO.getDepartment().getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        employee.setFirstName(employeeDTO.getFirstName());
        employee.setLastName(employeeDTO.getLastName());
        employee.setEmail(employeeDTO.getEmail());
        employee.setDepartment(department);
        employee.setPosition(employeeDTO.getPosition());
        
        Employee updatedEmployee = employeeRepository.save(employee);
        return toEmployeeDTO(updatedEmployee);
    }

    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id);
    }

    private EmployeeDTO toEmployeeDTO(Employee employee) {
        DepartmentDTO departmentDTO = new DepartmentDTO(
                employee.getDepartment().getDepartmentId(),
                employee.getDepartment().getName(),
                employee.getDepartment().getResponsiblePerson(),
                employee.getDepartment().getEmail()
        );
        return new EmployeeDTO(
                employee.getEmployeeId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                departmentDTO,
                employee.getPosition()
        );
    }
}