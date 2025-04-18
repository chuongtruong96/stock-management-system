// src/main/java/com/example/stationerymgntbe/controller/ReportController.java
package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /* ----------  FE cũ: /reports?year&month  ---------- */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> summary(@RequestParam int year,@RequestParam int month){
        /* Trả về chỉ summary (List<ReportDTO>) để FE cũ dùng */
        return ResponseEntity.ok(reportService.fetchMonthly(year,month).getSummary());
    }

    /* ----------  FE cũ: /reports/export/excel ---------- */
    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> excel(@RequestParam String month) throws Exception{
        String[] p = month.split("-");
        int y = Integer.parseInt(p[0]);
        int m = Integer.parseInt(p[1]);
        byte[] body = reportService.export(y,m,"excel");
        String fn = "report_%d_%02d.xlsx".formatted(y,m);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename="+fn)
                .body(body);
    }

    /* ----------  (OPTIONAL) mới: /reports/full ---------- */
    @GetMapping("/full")
    @PreAuthorize("hasRole('ADMIN')")
    public MonthlyReportDTO full(@RequestParam int year,@RequestParam int month){
        return reportService.fetchMonthly(year,month);
    }

    /* ----------  (OPTIONAL) export PDF ---------- */
    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> pdf(@RequestParam String month) throws Exception{
        String[] p = month.split("-");
        int y=Integer.parseInt(p[0]); int m=Integer.parseInt(p[1]);
        byte[] body = reportService.export(y,m,"pdf");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=report_%d_%02d.pdf".formatted(y,m))
                .body(body);
    }
}