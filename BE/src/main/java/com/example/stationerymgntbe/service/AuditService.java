package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.entity.User;
import com.example.stationerymgntbe.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {
    
    public void logOrderCreation(Order order, User user) {
        log.info("AUDIT: Order created - OrderId: {}, User: {}, Department: {}", 
            order.getOrderId(), user.getUsername(), order.getDepartment().getName());
    }
    
    public void logOrderStatusChange(Order order, OrderStatus oldStatus, OrderStatus newStatus, 
                                   User user, String reason) {
        log.info("AUDIT: Order status changed - OrderId: {}, From: {}, To: {}, User: {}, Reason: {}", 
            order.getOrderId(), oldStatus, newStatus, user.getUsername(), reason);
    }
    
    public void logOrderApproval(Order order, User admin, String comment) {
        log.info("AUDIT: Order approved - OrderId: {}, Admin: {}, Comment: {}", 
            order.getOrderId(), admin.getUsername(), comment);
    }
    
    public void logOrderRejection(Order order, User admin, String reason) {
        log.info("AUDIT: Order rejected - OrderId: {}, Admin: {}, Reason: {}", 
            order.getOrderId(), admin.getUsername(), reason);
    }
}