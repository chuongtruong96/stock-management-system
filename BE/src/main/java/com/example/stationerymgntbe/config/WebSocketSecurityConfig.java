package com.example.stationerymgntbe.config;

import java.util.Collections;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwt;

    /* ───── endpoint & CORS ───── */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry reg) {
        reg.addEndpoint("/ws")
           .setAllowedOriginPatterns("http://localhost:3000")
           .withSockJS();                 // fallback
    }

    /* ───── broker & prefix ───── */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry reg) {
        reg.enableSimpleBroker("/topic", "/queue");   // PHẢI có /queue
        reg.setApplicationDestinationPrefixes("/app");
        reg.setUserDestinationPrefix("/user");       // để FE sub /user/queue/…
    }

    /* ───── interceptor gắn Principal từ JWT (như bạn có) ───── */
    @Override
    public void configureClientInboundChannel(ChannelRegistration reg){
        reg.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> msg, MessageChannel ch) {
                StompHeaderAccessor acc = StompHeaderAccessor.wrap(msg);

                if (StompCommand.CONNECT.equals(acc.getCommand())) {

                    String bearer = acc.getFirstNativeHeader("Authorization");   // lấy header FE gửi
                    if (bearer != null && bearer.startsWith("Bearer "))
                        bearer = bearer.substring(7);

                    if (bearer != null && jwt.validateToken(bearer)) {
                        // ---- tự xây Authentication giống filter HTTP ----
                        String username = jwt.getUsernameFromToken(bearer);
                        String role     = jwt.getRoleFromToken(bearer);
                        if (role != null && role.startsWith("ROLE_"))
                            role = role.substring(5);

                        var auth = new UsernamePasswordAuthenticationToken(
                                username, null,
                                Collections.singletonList(new SimpleGrantedAuthority(role)));

                        acc.setUser(auth);           // gắn Principal cho session WS
                    }
                }
                return msg;
            }

        });
    }
}
