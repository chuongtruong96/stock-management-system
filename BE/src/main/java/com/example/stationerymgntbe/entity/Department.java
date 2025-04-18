package com.example.stationerymgntbe.entity;

import jakarta.persistence.*;
import lombok.*;
@Getter
@Setter
@Entity
@Table(name = "departments")
@NoArgsConstructor
@AllArgsConstructor
public class Department extends AbstractEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer departmentId;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;
}
