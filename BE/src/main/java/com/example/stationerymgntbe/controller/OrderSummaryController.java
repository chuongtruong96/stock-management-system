package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.OrderSummaryDTO;
import com.example.stationerymgntbe.service.OrderSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
public class OrderSummaryController {
    private final OrderSummaryService svc;
// 1) đọc persisted
@GetMapping
public ResponseEntity<List<OrderSummaryDTO>> listPersisted(
    @RequestParam(required=false) Integer deptId,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
) {
  return ResponseEntity.ok(
    svc.fetchSummaries(deptId, from, to)
  );
}
    @GetMapping("/dynamic")
  public List<OrderSummaryDTO> dynamic(
    @RequestParam(required=false) Integer deptId,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
      return svc.fetchSummariesDynamic(deptId, from, to);
  }

  @PostMapping("/run")
@PreAuthorize("hasRole('ADMIN')")
public void runRange(
  @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
  @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
    svc.aggregateRange(from, to);
}
}