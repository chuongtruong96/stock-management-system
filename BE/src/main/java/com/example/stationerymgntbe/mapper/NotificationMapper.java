package com.example.stationerymgntbe.mapper;

import com.example.stationerymgntbe.dto.NotificationDTO;
import com.example.stationerymgntbe.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationDTO toDto(Notification n);
    Notification toEntity(NotificationDTO dto);
}