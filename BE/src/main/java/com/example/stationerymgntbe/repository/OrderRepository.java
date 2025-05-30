// src/main/java/com/example/stationerymgntbe/repository/OrderRepository.java
package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.Order;
import com.example.stationerymgntbe.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.*;

public interface OrderRepository extends JpaRepository<Order, Integer> {

       /* ========== các truy vấn đã có ========= */
       @Query("SELECT o FROM Order o LEFT JOIN FETCH o.department d")
       List<Order> findAllWithDetails();

       Page<Order> findByCreatedByUserIdOrderByCreatedAtDesc(Integer uid, Pageable pageable);

       @Query("SELECT o FROM Order o LEFT JOIN FETCH o.department d WHERE o.orderId = :orderId")
       Optional<Order> findByIdWithDetails(@Param("orderId") Integer orderId);

       List<Order> findByStatus(OrderStatus status);

       List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

       List<Order> findByDepartment_DepartmentId(Integer departmentId);

       List<Order> findByCreatedByUserIdOrderByCreatedAtDesc(Integer userId);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
       long countByStatus(@Param("status") OrderStatus status);

       @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
       long countByCreatedAtBetween(@Param("start") LocalDateTime start,
                     @Param("end") LocalDateTime end);

       Optional<Order> findTopByDepartmentDepartmentIdOrderByCreatedAtDesc(Integer departmentId);

       /* ======= Báo cáo tổng hợp ======= */
       @Query(value = """
                     SELECT d.name            AS department,
                            p.code            AS product_code,
                            p.name            AS product_name_vn,
                            SUM(oi.quantity)  AS qty,
                            u.name_vn        AS unit
                     FROM   orders o
                     JOIN   departments d  ON d.department_id = o.department_id
                     JOIN   order_items oi ON oi.order_id = o.order_id
                     JOIN   products    p  ON p.product_id  = oi.product_id
                     JOIN   units       u  ON u.unit_id     = p.unit_id
                     WHERE  o.created_at >= :start
                     AND    o.created_at <  :end
                     GROUP  BY d.name, p.code, p.name, u.name_vn
                     ORDER  BY d.name, p.name
                     """, nativeQuery = true)
       List<Object[]> getReportData(@Param("start") LocalDateTime start,
                     @Param("end") LocalDateTime end);

       /* ========== Phân trang theo tháng ========== */
       @Query(nativeQuery = true, value = "SELECT * FROM orders WHERE created_at BETWEEN :start AND :end", countQuery = "SELECT COUNT(*) FROM orders WHERE created_at BETWEEN :start AND :end")
       Page<Order> findPageByMonth(@Param("start") LocalDateTime start,
                     @Param("end") LocalDateTime end,
                     Pageable pageable);
}