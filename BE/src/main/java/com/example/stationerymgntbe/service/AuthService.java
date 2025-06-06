package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.config.JwtUtil;
import com.example.stationerymgntbe.dto.LoginRequest;
import com.example.stationerymgntbe.dto.LoginResponse;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        String role = user.getRole().toString(); // e.g., "ADMIN"
        // System.out.println("Role being passed to JwtUtil: " + role);
        String token = jwtUtil.generateToken(user.getUsername(), role);
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRole(role); // Send "ADMIN" or "USER" to the frontend
        return response;
    }
}