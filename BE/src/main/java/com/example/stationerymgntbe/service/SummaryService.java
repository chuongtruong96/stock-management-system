package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.ProductOrderSummaryDTO;
import com.example.stationerymgntbe.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SummaryService {
    private final OrderItemRepository itemRepo;

    public List<ProductOrderSummaryDTO> topProducts(int limit) {
        return itemRepo.findTopProducts(PageRequest.of(0, limit));
    }
}