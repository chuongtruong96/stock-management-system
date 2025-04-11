// src/main/java/com/example/stationerymgntbe/controller/UserController.java
package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.UserResponseDTO;
import com.example.stationerymgntbe.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        UserResponseDTO userResponseDTO = userService.getCurrentUser();
        return ResponseEntity.ok(userResponseDTO);
    }
}