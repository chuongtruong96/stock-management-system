package com.example.stationerymgntbe.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        String role = null;

        // Log all requests for debugging
        System.out.println("🔍 JWT_FILTER: Processing " + method + " " + requestURI);
        System.out.println("🔍 JWT_FILTER: Auth header present: " + (authHeader != null ? "Yes" : "No"));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            System.out.println("🔍 JWT_FILTER: Token extracted, length: " + token.length());
            try {
                username = jwtUtil.getUsernameFromToken(token);
                role = jwtUtil.getRoleFromToken(token);
                System.out.println("🔍 JWT_FILTER: Token parsed - Username: " + username + ", Role: " + role);
            } catch (Exception e) {
                System.out.println("🔍 JWT_FILTER: Failed to parse JWT token: " + e.getMessage());
                logger.error("Failed to parse JWT token: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("🔍 JWT_FILTER: Validating token for user: " + username);
            if (jwtUtil.validateToken(token)) {
                String authority = role.startsWith("ROLE_") ? role.substring(5) : role;
                System.out.println("🔍 JWT_FILTER: Token valid, setting authority: " + authority);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority(authority)));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("🔍 JWT_FILTER: Authentication set successfully");
            } else {
                System.out.println("🔍 JWT_FILTER: Token validation failed");
            }
        } else if (username == null && authHeader != null) {
            System.out.println("🔍 JWT_FILTER: Username is null despite auth header present");
        }

        filterChain.doFilter(request, response);
    }
}