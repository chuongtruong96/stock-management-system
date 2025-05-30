package com.example.stationerymgntbe.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service @RequiredArgsConstructor @Slf4j
public class FileStorageService {

  @Value("${uploadDir}")
  private String root;

  public Path savePdf(Integer orderId, byte[] bytes) throws IOException{
      Path dir = Paths.get(root,"orders");
      Files.createDirectories(dir);
      Path p = dir.resolve(orderId+".pdf");
      Files.write(p,bytes);
      return p;
  }

  public byte[] load(Path p) throws IOException{
      return Files.readAllBytes(p);
  }
}