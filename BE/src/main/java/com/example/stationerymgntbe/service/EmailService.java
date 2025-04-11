package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Value("${email.admin:admin@company.com}")
    private String adminEmail;

    @Value("${email.from:noreply@company.com}")
    private String fromEmail;

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

    // Gửi email thông báo cho admin khi có đơn hàng mới
    public void sendOrderNotificationToAdmin(OrderDTO orderDTO) {
        Department department = departmentRepository.findById(orderDTO.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + orderDTO.getDepartmentId()));

        String subject = "New Stationery Order from " + department.getName();
        String body = "A new order has been placed by " + department.getName() + ".\n" +
                      "Order ID: " + orderDTO.getOrderId() + "\n" +
                      "Please review the order in the system.";
        sendEmail(adminEmail, subject, body);
    }

    // Gửi email thông báo cho phòng ban khi đơn hàng được phê duyệt
    public void sendOrderApprovalNotification(Order order) {
        Department department = order.getEmployee().getDepartment();
        String subject = "Your Stationery Order Has Been Approved";
        String body = "Dear " + department.getName() + ",\n\n" +
                      "Your order (ID: " + order.getOrderId() + ") has been approved.\n" +
                      "You can check the details in the system.\n\n" +
                      "Best regards,\nStationery System";
        sendEmail(department.getEmail(), subject, body);
    }

    // Gửi email thông báo cho phòng ban khi đơn hàng bị từ chối
    public void sendOrderRejectionNotification(Order order, String reason) {
        Department department = order.getEmployee().getDepartment();
        String subject = "Your Stationery Order Has Been Rejected";
        String body = "Dear " + department.getName() + ",\n\n" +
                      "Your order (ID: " + order.getOrderId() + ") has been rejected.\n" +
                      "Reason: " + reason + "\n" +
                      "Please review and resubmit if necessary.\n\n" +
                      "Best regards,\nStationery System";
        sendEmail(department.getEmail(), subject, body);
    }
}