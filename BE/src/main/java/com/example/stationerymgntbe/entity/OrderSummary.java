package com.example.stationerymgntbe.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name="order_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer departmentId;
    private LocalDate date;
    private Integer totalOrders;
    private Integer approvedCount;
    private Integer rejectedCount;
    private Integer pendingCount;
}