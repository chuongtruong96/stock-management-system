package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.dto.ProductOrderSummaryDTO;
import com.example.stationerymgntbe.entity.OrderItem;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product WHERE oi.order.orderId = :orderId")
    Collection<OrderItem> findByOrderOrderId(@Param("orderId") Integer orderId);

    @Query(
       "SELECT new com.example.stationerymgntbe.dto.ProductOrderSummaryDTO(oi.product.productId, oi.product.name, SUM(oi.quantity)) " +
       "FROM OrderItem oi " +
       "GROUP BY oi.product.productId, oi.product.name " +
       "ORDER BY SUM(oi.quantity) DESC"
    )
    List<ProductOrderSummaryDTO> findTopProducts(Pageable pageable);
}