package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
    @Query("""
       SELECT n
       FROM Notification n
       WHERE n.userId = :uid OR n.userId IS NULL
       ORDER BY n.createdAt DESC
       """)
    List<Notification> findForUser(Integer uid);
    
}