package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.UserInputDTO;
import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.enums.UserRole;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.UserMapper;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import com.example.stationerymgntbe.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return userMapper.toDto(user);
    }

    public User getCurrentUserEntity() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public UserResponseDTO createUser(UserInputDTO dto) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId()));
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole() == null ? UserRole.USER : dto.getRole());
        user.setDepartment(dept);
        userRepository.save(user);
        return userMapper.toDto(user);
    }

    public UserResponseDTO updateUser(Integer id, UserInputDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + dto.getDepartmentId()));

        user.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setRole(dto.getRole());
        user.setDepartment(dept);

        // Save the user
        userRepository.save(user);

        // Return the updated user as a DTO
        return userMapper.toDto(user);
    }

    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public void updatePassword(User u, String rawPw, PasswordEncoder encoder) {
        u.setPassword(encoder.encode(rawPw));
        userRepository.save(u);
    }

    public List<String> getAdminUsernames() {
    return userRepository.findAll().stream()
            .filter(u -> u.getRole() == UserRole.ADMIN)
            .map(User::getUsername)
            .toList();
}
}