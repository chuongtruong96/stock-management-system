package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.OrderSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderSummaryRepository extends JpaRepository<OrderSummary, Long> {
    Optional<OrderSummary> findByDepartmentIdAndDate(Integer deptId, LocalDate date);

    List<OrderSummary> findByDateBetween(LocalDate from, LocalDate to);
    List<OrderSummary> findByDepartmentIdAndDateBetween(Integer deptId, LocalDate from, LocalDate to);

}