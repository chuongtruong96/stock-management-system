package com.example.stationerymgntbe.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        // System.out.println("JWT Secret: " + secret); // Add logging
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        String roleName = role.toUpperCase();
        if (roleName.startsWith("ROLE_")) {
            roleName = roleName.substring(5);
        }
        roleName = "ROLE_" + roleName;
        System.out.println("Final role in token: " + roleName);
        claims.put("role", roleName);
    
        if (!roleName.equals("ROLE_ADMIN") && !roleName.equals("ROLE_USER")) {
            throw new IllegalArgumentException("Invalid role: " + roleName);
        }
    
        Date issuedAt = new Date();
        Date expirationDate = new Date(System.currentTimeMillis() + expiration);
        System.out.println("Issued at: " + issuedAt);
        System.out.println("Expiration: " + expirationDate);
    
        return Jwts.builder()
                .setClaims(claims) // Set custom claims first
                .setSubject(username) // Add subject
                .setIssuedAt(issuedAt) // Add issued at
                .setExpiration(expirationDate) // Add expiration
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Explicitly specify algorithm
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        String role = (String) claims.get("role");
        // System.out.println("Role from token: " + role); // Add logging
        return role;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}