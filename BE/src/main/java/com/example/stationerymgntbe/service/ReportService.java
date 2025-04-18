package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.*;
import com.example.stationerymgntbe.mapper.OrderMapper;
import com.example.stationerymgntbe.repository.OrderRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Tổng hợp – Xuất báo cáo (Excel / PDF).
 *  - Excel dùng Apache POI
 *  - PDF dùng OpenPDF
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepo;
    private final OrderMapper     orderMapper;

    /* ═══════════════════════════════════ helpers ═══════════════════════════════════ */

    /** [start, end) cho tháng ‑ năm được chọn */
    private LocalDateTime[] range(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        return new LocalDateTime[]{start, start.plusMonths(1)};
    }

    /* ════════════════════════ 1. Lấy & cache dữ liệu gộp ═════════════════════════ */

    @Cacheable(value = "monthlyReports", key = "#year + '-' + #month", unless = "#result == null")
    public MonthlyReportDTO fetchMonthly(int year, int month) {

        var r = range(year, month);

        List<OrderDTO> orders = orderRepo.findByCreatedAtBetween(r[0], r[1])
                                         .stream()
                                         .map(orderMapper::toOrderDTO)
                                         .toList();

        List<ReportDTO> summary = toReportDTO(orderRepo.getReportData(r[0], r[1]));

        List<ChartSeriesDTO> chart = summary.stream()
                .collect(Collectors.groupingBy(ReportDTO::getProductNameVn,
                        Collectors.summingInt(ReportDTO::getQuantity)))
                .entrySet().stream()
                .map(e -> new ChartSeriesDTO(e.getKey(), e.getValue()))
                .toList();

        return MonthlyReportDTO.builder()
                               .orders(orders)
                               .summary(summary)
                               .chart(chart)
                               .build();
    }

    /* ════════════════════════ 2. Export đa định dạng ══════════════════════════════ */

    public byte[] export(int year, int month, String fmt) throws IOException {
        List<ReportDTO> rows = fetchMonthly(year, month).getSummary();
        return switch (fmt.toLowerCase()) {
            case "excel" -> exportExcel(rows);
            case "pdf"   -> exportPdf(rows, year, month);
            default      -> throw new IllegalArgumentException("Unsupported format: " + fmt);
        };
    }

    /* ═══════════════════════════════ Excel (POI) ══════════════════════════════════ */

    private byte[] exportExcel(List<ReportDTO> rows) throws IOException {

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Summary");
            String[] cols = {"Department", "Product Code", "Product Name (VN)", "Quantity", "Unit"};

            /* header style */
            CellStyle header = wb.createCellStyle();
            org.apache.poi.ss.usermodel.Font bold = wb.createFont();
            bold.setBold(true);
            header.setFont(bold);

            Row head = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell c = head.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(header);
            }

            int r = 1;
            for (ReportDTO d : rows) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(d.getDepartment());
                row.createCell(1).setCellValue(d.getProductCode());
                row.createCell(2).setCellValue(d.getProductNameVn());
                row.createCell(3).setCellValue(d.getQuantity());
                row.createCell(4).setCellValue(d.getUnit());
            }
            for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                wb.write(out);
                return out.toByteArray();
            }
        }
    }

    /* ═══════════════════════════════ PDF (OpenPDF) ════════════════════════════════ */

    private byte[] exportPdf(List<ReportDTO> rows, int year, int month) throws IOException {

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4.rotate(), 20, 20, 30, 20);
            PdfWriter.getInstance(doc, out);

            doc.open();

            /* Tiêu đề */
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Paragraph title = new Paragraph("Stationery Report " + month + "/" + year, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            doc.add(title);

            /* Bảng dữ liệu */
            float[] widths = {30f, 22f, 60f, 15f, 15f};
            PdfPTable table = new PdfPTable(widths);
            table.setWidthPercentage(100);

            Font headerF = new Font(Font.HELVETICA, 11, Font.BOLD);
            Stream.of("Department", "Product Code", "Product Name (VN)", "Qty", "Unit")
                  .forEach(col -> {
                      PdfPCell cell = new PdfPCell(new Phrase(col, headerF));
                      cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                      cell.setBackgroundColor(new Color(211, 211, 211));
                      table.addCell(cell);
                  });

            for (ReportDTO d : rows) {
                table.addCell(d.getDepartment());
                table.addCell(d.getProductCode());
                table.addCell(d.getProductNameVn());
                table.addCell(String.valueOf(d.getQuantity()));
                table.addCell(d.getUnit());
            }

            doc.add(table);
            doc.close();
            return out.toByteArray();
        }
    }

    /* ═════════════════════════════ mapping helper ════════════════════════════════ */

    private List<ReportDTO> toReportDTO(List<Object[]> raw) {
        AtomicLong seq = new AtomicLong(1);
        return raw.stream()
                  .map(r -> ReportDTO.builder()
                          .id(seq.getAndIncrement())
                          .department((String)  r[0])
                          .productCode((String)  r[1])
                          .productNameVn((String) r[2])
                          .quantity(((Number)   r[3]).intValue())
                          .unit((String)         r[4])
                          .build())
                  .toList();
    }
}
