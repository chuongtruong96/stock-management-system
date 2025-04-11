package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.employee e LEFT JOIN FETCH e.department")
    List<Order> findAll();

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.employee e LEFT JOIN FETCH e.department WHERE o.orderId = :orderId")
    Optional<Order> findByIdWithDetails(@Param("orderId") Integer orderId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByEmployeeDepartmentDepartmentId(Integer departmentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    Optional<Order> findTopByEmployeeDepartmentDepartmentIdOrderByCreatedAtDesc(Integer departmentId);

    @Query("SELECT d.name, p.code, p.name, SUM(oi.quantity), u.nameVn " +
           "FROM Order o " +
           "JOIN o.employee e " +
           "JOIN e.department d " +
           "JOIN o.items oi " +
           "JOIN oi.product p " +
           "JOIN p.unit u " +
           "WHERE YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month " +
           "GROUP BY d.name, p.code, p.name, u.nameVn")
    List<Object[]> getReportData(@Param("year") int year, @Param("month") int month);
}