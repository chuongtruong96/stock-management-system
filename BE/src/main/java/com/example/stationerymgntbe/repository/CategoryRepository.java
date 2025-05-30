package com.example.stationerymgntbe.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.stationerymgntbe.entity.Category;

public interface CategoryRepository extends JpaRepository<Category,Integer> {

    boolean existsByNameVnIgnoreCase(String nameVn);
    boolean existsByNameEnIgnoreCase(String nameEn);

    /* ----- THÊM 2 API để tra ra Optional<Category> ----- */
    Optional<Category> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);   // vẫn giữ, chỗ nào cần boolean

    @Query("""
   SELECT c as cat , COUNT(p) AS cnt
   FROM Category c LEFT JOIN Product p ON p.category = c
   GROUP BY c
""")
List<Object[]> findAllWithCount();
}
