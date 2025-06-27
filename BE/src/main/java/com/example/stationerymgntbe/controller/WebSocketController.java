package com.example.stationerymgntbe.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/websocket/health")
    public Map<String, Object> getWebSocketHealth() {
        log.info("WebSocket health check requested");
        return Map.of(
            "status", "UP",
            "websocket", "available",
            "endpoints", Map.of(
                "stomp", "/ws",
                "topics", new String[]{"/topic/notifications/global", "/topic/orders/pending"},
                "queues", new String[]{"/user/queue/notifications"}
            )
        );
    }

    @GetMapping("/api/websocket/test-broadcast")
    public Map<String, String> testBroadcast() {
        log.info("Broadcasting test message");
        try {
            messagingTemplate.convertAndSend("/topic/notifications/global", 
                Map.of(
                    "id", System.currentTimeMillis(),
                    "title", "Test Notification",
                    "message", "WebSocket connection is working!",
                    "link", "/test",
                    "read", false,
                    "createdAt", java.time.LocalDateTime.now().toString()
                )
            );
            return Map.of("status", "success", "message", "Test broadcast sent");
        } catch (Exception e) {
            log.error("Error broadcasting test message", e);
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Map<String, String> testMessage(Map<String, String> message) {
        log.info("Test message received: {}", message);
        return Map.of("response", "WebSocket is working", "echo", message.toString());
    }
}