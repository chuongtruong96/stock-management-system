package com.example.stationerymgntbe.config;

import java.util.Collections;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwt;

    /* ───── interceptor gắn Principal từ JWT ───── */
    @Override
    public void configureClientInboundChannel(ChannelRegistration reg){
        reg.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> msg, MessageChannel ch) {
                StompHeaderAccessor acc = StompHeaderAccessor.wrap(msg);

                if (StompCommand.CONNECT.equals(acc.getCommand())) {
                    log.info("[WS-SECURITY] Processing CONNECT command");

                    String bearer = acc.getFirstNativeHeader("Authorization");   // lấy header FE gửi
                    if (bearer != null && bearer.startsWith("Bearer ")) {
                        bearer = bearer.substring(7);
                        log.info("[WS-SECURITY] Found Bearer token");
                    }

                    if (bearer != null && jwt.validateToken(bearer)) {
                        // ---- tự xây Authentication giống filter HTTP ----
                        String username = jwt.getUsernameFromToken(bearer);
                        String role     = jwt.getRoleFromToken(bearer);
                        if (role != null && role.startsWith("ROLE_"))
                            role = role.substring(5);

                        var auth = new UsernamePasswordAuthenticationToken(
                                username, null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

                        acc.setUser(auth);           // gắn Principal cho session WS
                        log.info("[WS-SECURITY] Authentication set for user: {}", username);
                    } else {
                        log.warn("[WS-SECURITY] Invalid or missing JWT token");
                    }
                }
                return msg;
            }

        });
    }
}