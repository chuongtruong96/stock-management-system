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

    /* ========== EXISTING METHODS ========= */
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.department d LEFT JOIN FETCH o.createdBy LEFT JOIN FETCH o.approvedBy")
    List<Order> findAllWithDetails();

    Page<Order> findByCreatedByUserIdOrderByCreatedAtDesc(Integer uid, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.department d LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product p LEFT JOIN FETCH p.unit LEFT JOIN FETCH o.createdBy LEFT JOIN FETCH o.approvedBy WHERE o.orderId = :orderId")
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

    /* ======= EXISTING REPORT METHODS ======= */
    @Query(value = """
            SELECT d.name AS department,
                   p.code AS product_code,
                   p.name AS product_name_vn,
                   SUM(oi.quantity) AS qty,
                   u.name_vn AS unit
            FROM orders o
            JOIN departments d ON d.department_id = o.department_id
            JOIN order_items oi ON oi.order_id = o.order_id
            JOIN products p ON p.product_id = oi.product_id
            JOIN units u ON u.unit_id = p.unit_id
            WHERE o.created_at >= :start
              AND o.created_at < :end
            GROUP BY d.name, p.code, p.name, u.name_vn
            ORDER BY d.name, p.name
            """, nativeQuery = true)
    List<Object[]> getReportData(@Param("start") LocalDateTime start,
                                @Param("end") LocalDateTime end);

    @Query(nativeQuery = true, 
           value = "SELECT * FROM orders WHERE created_at BETWEEN :start AND :end", 
           countQuery = "SELECT COUNT(*) FROM orders WHERE created_at BETWEEN :start AND :end")
    Page<Order> findPageByMonth(@Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end,
                               Pageable pageable);

    /* ========== NEW DASHBOARD METHODS ========== */
    
    // Count orders by status and date range
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :start AND :end")
    Long countByStatusAndCreatedAtBetween(@Param("status") OrderStatus status, 
                                         @Param("start") LocalDateTime start, 
                                         @Param("end") LocalDateTime end);

    // Count orders with signatures (orders that have signedPdfPath)
    @Query("SELECT COUNT(o) FROM Order o WHERE o.signedPdfPath IS NOT NULL AND o.createdAt BETWEEN :start AND :end")
    Long countOrdersWithSignaturesInMonth(@Param("start") LocalDateTime start, 
                                         @Param("end") LocalDateTime end);

    // Count distinct departments with orders in a month
    @Query("SELECT COUNT(DISTINCT o.department.departmentId) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    Long countDistinctDepartmentsWithOrdersInMonth(@Param("start") LocalDateTime start, 
                                                  @Param("end") LocalDateTime end);

    // Count distinct departments with submitted orders in a month
    @Query("SELECT COUNT(DISTINCT o.department.departmentId) FROM Order o WHERE o.status IN ('SUBMITTED', 'APPROVED', 'REJECTED') AND o.createdAt BETWEEN :start AND :end")
    Long countDistinctDepartmentsWithSubmittedOrdersInMonth(@Param("start") LocalDateTime start, 
                                                           @Param("end") LocalDateTime end);

    // Find distinct department IDs with orders in a month
    @Query("SELECT DISTINCT o.department.departmentId FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    List<Integer> findDistinctDepartmentIdsWithOrdersInMonth(@Param("start") LocalDateTime start, 
                                                            @Param("end") LocalDateTime end);

    // Additional methods for OrderService
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    List<Order> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime dateTime);

    long countByStatusIn(List<OrderStatus> statuses);

    long countByStatusAndUpdatedAtAfter(OrderStatus status, LocalDateTime dateTime);

    Page<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    // Find all orders ordered by creation date descending (for admin view)
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Find all orders with details for admin view
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.department d LEFT JOIN FETCH o.createdBy LEFT JOIN FETCH o.approvedBy ORDER BY o.createdAt DESC")
    List<Order> findAllWithDetailsOrderByCreatedAtDesc();
}