package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.entity.PasswordResetToken;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.exception.InvalidTokenException;
import com.example.stationerymgntbe.repository.PasswordResetTokenRepository;
import com.example.stationerymgntbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final PasswordResetTokenRepository tokenRepo;
    private final UserRepository              userRepo;

    /** Tạo token mới – xoá token cũ nếu tồn tại */
    public String create(Integer userId, int minutes) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User "+userId));

        /* xoá token cũ nếu có */
        tokenRepo.findByUser_UserId(userId).ifPresent(tokenRepo::delete);

        String raw = UUID.randomUUID().toString();
        PasswordResetToken t = new PasswordResetToken();
        t.setToken(raw);
        t.setUser(user);
        t.setExpiresAt(LocalDateTime.now().plusMinutes(minutes));
        tokenRepo.save(t);

        return raw;
    }

    /** Kiểm tra token hợp lệ, trả về entity */
    public PasswordResetToken validate(String raw) {

        PasswordResetToken t = tokenRepo.findByToken(raw)
                .orElseThrow(() -> new InvalidTokenException("Token không tồn tại"));

        if (t.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new InvalidTokenException("Token đã hết hạn");

        return t;
    }

    /** Consume – xoá token sau khi dùng và trả về User */
    public User consume(String raw) {
        PasswordResetToken t = validate(raw);
        tokenRepo.delete(t);
        return t.getUser();
    }
}
