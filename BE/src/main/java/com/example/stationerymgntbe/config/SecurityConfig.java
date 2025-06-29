package com.example.stationerymgntbe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.stationerymgntbe.repository.UserRepository;

import jakarta.servlet.http.HttpServletResponse;
import com.example.stationerymgntbe.entity.User;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(requests -> requests
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/assets/**").permitAll() // Allow access to static assets
                        .requestMatchers("/icons/**").permitAll() // Allow access to category icons
                        .requestMatchers("/uploads/**").permitAll() // Allow access to uploaded files
                        .requestMatchers("/placeholder-prod.png").permitAll() // Allow access to placeholder images
                        .requestMatchers("/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg").permitAll() // Allow access to static images
                        .requestMatchers("/static/**").permitAll() // Allow access to static resources
                        .requestMatchers(HttpMethod.GET, "/api/departments").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/all").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/category/{categoryId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/top-ordered").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/translate").permitAll() // Allow translation for all users
                        .requestMatchers(HttpMethod.GET, "/api/orders/order-window/status").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/check-period").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/dashboard/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/reports/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/summaries/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/products/stats").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/products/category-distribution").hasAuthority("ADMIN")
                        .requestMatchers("/api/units/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/users").hasAuthority("ADMIN")
                        .requestMatchers("/api/users/{id}").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/orders/order-window/toggle").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/orders/pending").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/orders/submitted").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/{id}/approve").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/{id}/reject").hasAuthority("ADMIN")
                        .requestMatchers("/api/notifications/announce").hasAuthority("ADMIN")
                        
                        // Authenticated user endpoints - allow both ADMIN and USER roles
                        .requestMatchers("/api/users/me").hasAnyAuthority("ADMIN", "USER")
                        .requestMatchers("/api/orders/mine").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders/{id}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders/{id}/items").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/orders/{id}/export").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/{id}/submit-signed").authenticated()
                        .requestMatchers("/api/notifications").authenticated()
                        .requestMatchers("/api/notifications/{id}/read").authenticated()
                        .requestMatchers("/api/notifications/unread-count").authenticated()
                        .requestMatchers("/api/notifications/mark-all-read").authenticated()
                        
                        // Default: require authentication for any other endpoint
                        .anyRequest().authenticated())
                .sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            String requestURI = request.getRequestURI();
                            String method = request.getMethod();
                            System.out.println("🔒 SECURITY: Authentication failed for " + method + " " + requestURI + ": " + authException.getMessage());
                            System.out.println("🔒 SECURITY: Auth header: " + request.getHeader("Authorization"));
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            String requestURI = request.getRequestURI();
                            String method = request.getMethod();
                            System.out.println("🔒 SECURITY: Access denied for " + method + " " + requestURI + ": " + accessDeniedException.getMessage());
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
                        }));

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration cfg = new CorsConfiguration();
        
        // Get allowed origins from environment variable
        String allowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            // Fallback for local development
            allowedOrigins = "http://localhost:3000,https://stationery-mgnt.netlify.app";
        }
        
        cfg.setAllowedOriginPatterns(List.of(allowedOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type"));
        cfg.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**",cfg);
        return src;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            String role = user.getRole().toString();
            // System.out.println("Role in UserDetailsService: " + role);
            String authority = role.startsWith("ROLE_") ? role.substring(5) : role;
            // System.out.println("Authority in UserDetailsService: " + authority);
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    java.util.Collections.singletonList(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority(authority)));
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}