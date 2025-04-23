// src/main/java/com/example/stationerymgntbe/controller/AdminUserController.java
package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.UserInputDTO;
import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserInputDTO dto) {
        UserResponseDTO created = userService.createUser(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Integer id,
            @RequestBody UserInputDTO userInputDTO) {
        UserResponseDTO updatedUser = userService.updateUser(id, userInputDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    
}
