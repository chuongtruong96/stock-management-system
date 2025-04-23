package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import com.example.stationerymgntbe.repository.UserRepository;
import com.example.stationerymgntbe.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService   authService;
    private final UserRepository userRepo;
    private final TokenService  tokenService;
    private final EmailService   emailService;
    private final UserService   userService;
    private final PasswordEncoder encoder;
    private final DepartmentRepository departmentRepo;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req){
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestBody ForgotRequest req){

        /* 1. tìm phòng ban theo email */
        Department dept = departmentRepo.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        /* 2. lấy user duy nhất của phòng ban */
        User user = userRepo.findByDepartment_DepartmentId(dept.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("No user for department"));

        /* 3. tạo token & gửi mail */
        String rawToken = tokenService.create(user.getUserId(),15);
        emailService.sendResetLink(dept.getEmail(), rawToken);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody ResetPwRequest r){
        User u = tokenService.consume(r.token());
        userService.updatePassword(u, r.newPw(), encoder);
        return ResponseEntity.ok("Password updated");
    }
}
