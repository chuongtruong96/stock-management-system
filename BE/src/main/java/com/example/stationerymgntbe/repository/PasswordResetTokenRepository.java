// src/main/java/com/example/stationerymgntbe/repository/PasswordResetTokenRepository.java
package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByToken(String token);

    /* tìm token hiện thời của user*/
    Optional<PasswordResetToken> findByUser_UserId(Integer userId);
}
