package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.dto.ReportDTO;
import com.example.stationerymgntbe.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/monthly")
    public ResponseEntity<List<OrderDTO>> getMonthlyReport(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }

    @GetMapping("/order-items/{orderId}")
    public ResponseEntity<List<OrderItemDTO>> getOrderItems(@PathVariable Integer orderId) {
        return ResponseEntity.ok(reportService.getOrderItems(orderId));
    }

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getReport(@RequestParam String month) {
        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthValue = Integer.parseInt(parts[1]);
        return ResponseEntity.ok(reportService.generateReport(year, monthValue));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportToExcel(@RequestParam String month) throws IOException {
        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthValue = Integer.parseInt(parts[1]);
        byte[] excelBytes = reportService.exportToExcel(year, monthValue);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=Stationery_Report_" + month + ".xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
    }
}