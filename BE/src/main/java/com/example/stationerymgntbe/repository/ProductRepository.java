package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findByCode(String code);

    boolean existsByCode(String code);

    Page<Product> findByCategoryCategoryId(Integer categoryId, Pageable pageable);
    
    List<Product> findByCategoryCategoryId(Integer categoryId);

    // Search functionality
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Product> findByNameOrCodeContainingIgnoreCase(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "p.category.categoryId = :categoryId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> findByCategoryAndNameOrCodeContainingIgnoreCase(
            @Param("categoryId") Integer categoryId, 
            @Param("query") String query, 
            Pageable pageable);

    // New method for dashboard statistics
    @Query("SELECT COUNT(DISTINCT p.category) FROM Product p WHERE p.category IS NOT NULL")
    Long countDistinctCategories();
    
    // Method to fetch all products with their units and categories eagerly loaded
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.unit LEFT JOIN FETCH p.category")
    List<Product> findAllWithUnitAndCategory();
}