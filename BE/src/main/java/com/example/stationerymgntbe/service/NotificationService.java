package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.NotificationDTO;
import com.example.stationerymgntbe.entity.Notification;
import com.example.stationerymgntbe.mapper.NotificationMapper;
import com.example.stationerymgntbe.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repo;
    private final NotificationMapper mapper;
    private final SimpMessagingTemplate broker;

    public NotificationDTO sendToUser(Integer userId,String username,
            String title,
            String msg,
            String link) {

        Notification n = repo.save(Notification.builder()
                .userId(userId) // cột userId bạn có thể lưu hoặc không
                .title(title)
                .message(msg)
                .link(link)
                .read(false)
                .build());

        NotificationDTO dto = mapper.toDto(n);

        // gửi đúng username (Principal.getName())
        broker.convertAndSendToUser(username,
                "/queue/notifications",
                dto);
        return dto;
    }

    // broadcast to all
    public void broadcast( String title, String msg, String link) {
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

    public List<NotificationDTO> findByUser(Integer uid) {
        return repo.findByUserIdOrderByCreatedAtDesc(uid)
                   .stream()
                   .map(mapper::toDto)
                   .toList();
      }

    public void markRead(Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }
}