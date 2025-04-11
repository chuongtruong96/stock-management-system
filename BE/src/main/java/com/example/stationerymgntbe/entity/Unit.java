package com.example.stationerymgntbe.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "units")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer unitId;

    @Column(name = "name_vn", nullable = false, unique = true)
    private String nameVn;

    @Column(name = "name_en", nullable = false, unique = true)
    private String nameEn;
}