package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.NotificationDTO;
import com.example.stationerymgntbe.service.NotificationService;
import com.example.stationerymgntbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService svc;
    private final UserService userSvc;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMine() {
        Integer uid = userSvc.getCurrentUser().getId();
        return ResponseEntity.ok(svc.findByUser(uid));
    }

    @PostMapping("/announce")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> announce(@RequestParam String title,
                                         @RequestParam String message,
                                         @RequestParam(required=false) String link) {
        svc.broadcast(title, message, link);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        svc.markRead(id);
        return ResponseEntity.ok().build();
    }
}