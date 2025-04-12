// src/main/java/com/example/stationerymgntbe/service/UserService.java
package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.DepartmentDTO;
import com.example.stationerymgntbe.dto.EmployeeDTO;
import com.example.stationerymgntbe.dto.UserInputDTO;
import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.entity.Employee;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.repository.EmployeeRepository;
import com.example.stationerymgntbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        System.out.println("Fetched users: " + users); // Log the raw users
        return users.stream()
                .map(this::toUserResponseDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isEmpty()) {
            throw new RuntimeException("User is not authenticated");
        }
        User user = findByUsername(username);
        return toUserResponseDTO(user);
    }

    public User getCurrentUserEntity() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || username.isEmpty()) {
            throw new RuntimeException("User is not authenticated");
        }
        return findByUsername(username);
    }

    public void createUser(UserInputDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole(userDTO.getRole());
        Employee employee = employeeRepository.findById(userDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        user.setEmployee(employee);
        userRepository.save(user);
    }

    public void updateUser(Integer id, UserInputDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDTO.getUsername());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        user.setRole(userDTO.getRole());
        Employee employee = employeeRepository.findById(userDTO.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        user.setEmployee(employee);
        userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private UserResponseDTO toUserResponseDTO(User user) {
        EmployeeDTO employeeDTO = null;
        if (user.getEmployee() != null) {
            DepartmentDTO departmentDTO = null;
            if (user.getEmployee().getDepartment() != null) {
                departmentDTO = new DepartmentDTO(
                        user.getEmployee().getDepartment().getDepartmentId(),
                        user.getEmployee().getDepartment().getName(),
                        user.getEmployee().getDepartment().getResponsiblePerson(),
                        user.getEmployee().getDepartment().getEmail());
            }
            employeeDTO = new EmployeeDTO(
                    user.getEmployee().getEmployeeId(),
                    user.getEmployee().getFirstName(),
                    user.getEmployee().getLastName(),
                    user.getEmployee().getEmail(),
                    departmentDTO,
                    user.getEmployee().getPosition());
        }
        return new UserResponseDTO(
                user.getUserId(),
                user.getUsername(),
                user.getRole().toString().toLowerCase(), // "USER" -> "user", "ADMIN" -> "admin"
                employeeDTO
        );
    }
}