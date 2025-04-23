package com.example.stationerymgntbe.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker          // bật STOMP broker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
      // allow raw ws:
      registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*");
  
      // plus SockJS fallback:
      registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*")
        .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // BE sẽ gửi ra ngoài prefix /topic/**
        registry.enableSimpleBroker("/topic");

        // FE gửi message ngược lại (nếu cần) thì prefix /app/**
        registry.setApplicationDestinationPrefixes("/app");
    }
}
