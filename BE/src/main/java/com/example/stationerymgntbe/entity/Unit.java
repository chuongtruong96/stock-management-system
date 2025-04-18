package com.example.stationerymgntbe.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "units")
@NoArgsConstructor
@AllArgsConstructor
public class Unit extends AbstractEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer unitId;

    @Column(name = "name_vn", nullable = false, unique = true)
    private String nameVn;

    @Column(name = "name_en", nullable = false, unique = true)
    private String nameEn;
}
