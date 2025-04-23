package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.NotificationDTO;
import com.example.stationerymgntbe.entity.Notification;
import com.example.stationerymgntbe.mapper.NotificationMapper;
import com.example.stationerymgntbe.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repo;
    private final NotificationMapper mapper;
    private final SimpMessagingTemplate broker;

    // create for one user
    public NotificationDTO sendToUser(Integer userId, String title, String msg, String link) {
        var n = Notification.builder()
            .userId(userId)
            .title(title)
            .message(msg)
            .link(link)
            .read(false)
            .build();
        n = repo.save(n);
        var dto = mapper.toDto(n);
        broker.convertAndSendToUser(userId.toString(), "/queue/notifications", dto);
        return dto;
    }

    // broadcast to all
    public void broadcast(String title, String msg, String link) {
        var n = Notification.builder()
            .userId(null)
            .title(title)
            .message(msg)
            .link(link)
            .read(false)
            .build();
        n = repo.save(n);
        var dto = mapper.toDto(n);
        broker.convertAndSend("/topic/notifications/global", dto);
    }

    public List<NotificationDTO> findByUser(Integer userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId)
                   .stream().map(mapper::toDto).collect(Collectors.toList());
    }

    public void markRead(Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }
}