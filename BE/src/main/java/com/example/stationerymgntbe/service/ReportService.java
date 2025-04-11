package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.OrderDTO;
import com.example.stationerymgntbe.dto.OrderItemDTO;
import com.example.stationerymgntbe.dto.ReportDTO;
import com.example.stationerymgntbe.mapper.OrderItemMapper;
import com.example.stationerymgntbe.mapper.OrderMapper;
import com.example.stationerymgntbe.repository.OrderItemRepository;
import com.example.stationerymgntbe.repository.OrderRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    public List<OrderDTO> getMonthlyReport(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return orderRepository.findByCreatedAtBetween(start, end).stream()
                .map(orderMapper::toOrderDTO)
                .collect(Collectors.toList());
    }

    public List<OrderItemDTO> getOrderItems(Integer orderId) {
        return orderItemRepository.findByOrderOrderId(orderId).stream()
                .map(orderItemMapper::toOrderItemDTO)
                .collect(Collectors.toList());
    }

    public List<ReportDTO> generateReport(int year, int month) {
        List<Object[]> results = orderRepository.getReportData(year, month);
        return results.stream().map(result -> {
            ReportDTO reportDTO = new ReportDTO();
            reportDTO.setDepartment((String) result[0]);
            reportDTO.setProductCode((String) result[1]);
            reportDTO.setProductNameVn((String) result[2]);
            reportDTO.setQuantity(((Number) result[3]).intValue());
            reportDTO.setUnit((String) result[4]);
            return reportDTO;
        }).collect(Collectors.toList());
    }

    public byte[] exportToExcel(int year, int month) throws IOException {
        List<ReportDTO> reportData = generateReport(year, month);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Stationery Report");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Department", "Product Code", "Product Name (VN)", "Quantity", "Unit"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowNum = 1;
            for (ReportDTO data : reportData) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(data.getDepartment());
                row.createCell(1).setCellValue(data.getProductCode());
                row.createCell(2).setCellValue(data.getProductNameVn());
                row.createCell(3).setCellValue(data.getQuantity());
                row.createCell(4).setCellValue(data.getUnit());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}