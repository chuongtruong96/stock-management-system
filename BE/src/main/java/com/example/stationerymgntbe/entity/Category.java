// src/main/java/com/example/stationerymgntbe/entity/Category.java
package com.example.stationerymgntbe.entity;

import jakarta.persistence.*;
import lombok.*;

// Category.java
// src/main/java/.../entity/Category.java
@Getter @Setter
@Entity @Table(name = "categories")
@NoArgsConstructor @AllArgsConstructor @Builder
public class Category extends AbstractEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;

    @Column(name = "name_vn", nullable = false, unique = true, length = 60)
    private String nameVn;

    @Column(name = "name_en", nullable = false, unique = true, length = 60)
    private String nameEn;

    /** Mã ngắn (BANG_KEO, BOOK…) để lookup  – unique */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    private String icon;   // sau này upload
}



