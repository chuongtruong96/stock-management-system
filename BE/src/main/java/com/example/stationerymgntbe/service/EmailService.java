package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.admin:admin@company.com}")
    private String adminEmail;

    @Value("${email.from:noreply@company.com}")
    private String fromEmail;

    /**
     * Generic method to send an email via JavaMailSender
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);
            mailSender.send(message);
        } catch (MailException e) {
            throw new RuntimeException("Failed to send email to " + to + ": " + e.getMessage(), e);
        }
    }

    /**
     * Notify the admin that a new order was created
     */
    @Async
    public void sendOrderNotificationToAdmin(OrderDTO orderDTO) {
        String subject = "New Stationery Order - Order ID: " + orderDTO.getOrderId();
        String body = "A new order has been submitted by Department ID: " + orderDTO.getDepartmentId() +
                ".\nPlease review it in the admin portal.";
        sendEmail(adminEmail, subject, body);
    }

    /**
     * Notify department that their order was approved
     */
    @Async
    public void sendOrderApprovalNotification(Order order) {
        String deptEmail = order.getDepartment().getEmail();
        String subject = "Your Order Has Been Approved - Order ID: " + order.getOrderId();
        String body = "Dear Department,\n\nYour order has been approved.\n\nBest regards,\nStationery System";
        sendEmail(deptEmail, subject, body);
    }

    /**
     * Notify department that their order was rejected, including reason
     */
    @Async
    public void sendOrderRejectionNotification(Order order, String reason) {
        String deptEmail = order.getDepartment().getEmail();
        String subject = "Your Order Has Been Rejected - Order ID: " + order.getOrderId();
        String body = "Dear Department,\n\nYour order has been rejected.\nReason: " + reason +
                "\n\nPlease review and adjust your order.\n\nBest regards,\nStationery System";
        sendEmail(deptEmail, subject, body);
    }

    public void sendResetLink(String toEmail, String token) {
        String link = "http://localhost:3000/reset/" + token;
        String subject = "Reset your password";
        String body = "Click the link below within 15 minutes:\n" + link;
        sendEmail(toEmail, subject, body);
    }
}
