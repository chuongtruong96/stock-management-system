package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findByCode(String code);

    List<Product> findByStockLessThan(int stock);
}