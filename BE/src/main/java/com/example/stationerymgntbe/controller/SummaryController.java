package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.ProductOrderSummaryDTO;
import com.example.stationerymgntbe.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
public class SummaryController {
    private final SummaryService service;

    @GetMapping("/top-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductOrderSummaryDTO>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(service.topProducts(limit));
    }
}