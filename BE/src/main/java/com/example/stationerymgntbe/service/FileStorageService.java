package com.example.stationerymgntbe.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@Service
public class FileStorageService {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public void savePdf(Integer orderId, byte[] pdfData) throws IOException {
        Path dir = Paths.get(uploadDir, "exported-orders");
        Files.createDirectories(dir);
        
        Path filePath = dir.resolve("order-" + orderId + ".pdf");
        Files.write(filePath, pdfData, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }
}