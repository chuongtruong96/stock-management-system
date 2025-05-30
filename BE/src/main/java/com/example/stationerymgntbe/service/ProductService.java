// src/main/java/.../service/ProductService.java
package com.example.stationerymgntbe.service;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.entity.*;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.ProductMapper;
import com.example.stationerymgntbe.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ProductService {

    private final ProductRepository  repo;
    private final UnitRepository     unitRepo;
    private final ProductMapper      map;

    /* ==========  READ  ========== */
    public List<ProductDTO> getAllProducts() {
        return repo.findAll().stream().map(map::toDto).toList();
    }
    public ProductDTO getProductById(Integer id) {
        return map.toDto( repo.findById(id)
                              .orElseThrow(() -> new ResourceNotFoundException("Product "+id)) );
    }

    /* ==========  CREATE  ========== */
    @Transactional
    public ProductDTO add(ProductDTO d){

        if (repo.existsByCode(d.getCode()))
            throw new IllegalStateException("Product code duplicated");

        Unit u = unitRepo.findByNameVnIgnoreCase(d.getUnit())
                         .or(() -> unitRepo.findByNameEnIgnoreCase(d.getUnit()))
                         .orElseThrow(() -> new ResourceNotFoundException("Unit "+d.getUnit()));

        Product p = map.toEntity(d);
        p.setUnit(u);
        p = repo.save(p);
        return map.toDto(p);
    }

    /* ==========  UPDATE  ========== */
    @Transactional
    public ProductDTO update(Integer id, ProductDTO d){
        Product p = repo.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product "+id));

        if (!p.getCode().equalsIgnoreCase(d.getCode())
            && repo.existsByCode(d.getCode()))
            throw new IllegalStateException("Product code duplicated");

        p.setCode(d.getCode());
        p.setName(d.getName());

        Unit u = unitRepo.findByNameVnIgnoreCase(d.getUnit())
                         .or(() -> unitRepo.findByNameEnIgnoreCase(d.getUnit()))
                         .orElseThrow(() -> new ResourceNotFoundException("Unit "+d.getUnit()));
        p.setUnit(u);

        return map.toDto( repo.save(p) );
    }

    /* ==========  DELETE  ========== */
    public void delete(Integer id){ repo.deleteById(id); }

    /* ==========  IMAGE UPLOAD  ========== */
    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public ProductDTO uploadImage(Integer id, MultipartFile file) throws IOException{

        Product p = repo.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product "+id));

        /* --- VALIDATION --- */
        if (file.isEmpty())                    throw new IllegalStateException("Empty file");
        if (!file.getContentType().startsWith("image/"))
            throw new IllegalStateException("Only image files allowed");
        if (file.getSize() > 5*1024*1024)      // 5 MB
            throw new IllegalStateException("File too large (>5MB)");

        /* --- SAVE --- */
        Path dir = Paths.get(uploadDir,"product-img");
        Files.createDirectories(dir);

        String ext = Optional.ofNullable(file.getOriginalFilename())
                             .filter(f -> f.contains("."))
                             .map(f -> f.substring(f.lastIndexOf('.')))
                             .orElse("");
        String fn  = id + ext;                  // ví dụ: 12.jpg
        Path  path = dir.resolve(fn);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        p.setImage(fn);
        return map.toDto( repo.save(p) );
    }

    public Page<ProductDTO> pageByCategory(Integer cid, Pageable pageable){
    return repo.findByCategoryCategoryId(cid,pageable).map(map::toDto);
}
}
