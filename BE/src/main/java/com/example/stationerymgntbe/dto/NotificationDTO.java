package com.example.stationerymgntbe.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Integer userId;
    private String title;
    private String message;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
}