package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product WHERE oi.order.orderId = :orderId")
    Collection<OrderItem> findByOrderOrderId(@Param("orderId") Integer orderId);
}