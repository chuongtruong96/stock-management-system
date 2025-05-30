package com.example.stationerymgntbe.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.stationerymgntbe.dto.CategoryDTO;
import com.example.stationerymgntbe.entity.Category;
import com.example.stationerymgntbe.exception.ResourceNotFoundException;
import com.example.stationerymgntbe.mapper.CategoryMapper;
import com.example.stationerymgntbe.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repo;
    private final CategoryMapper     map;

    /* ---------- Lấy tất cả ---------- */
    public List<CategoryDTO> all(){
    return repo.findAllWithCount().stream()
            .map(arr -> {
                CategoryDTO dto = map.toDto((Category)arr[0]);
                dto.setProductCount((Long)arr[1]);
                return dto;
            }).toList();
}

    /* ---------- Tạo mới ---------- */
    public CategoryDTO create(CategoryDTO d){
        if (repo.existsByNameVnIgnoreCase(d.getNameVn())
         || repo.existsByNameEnIgnoreCase(d.getNameEn())
         || repo.existsByCodeIgnoreCase(d.getCode()))
            throw new IllegalStateException("Category duplicated");

        return map.toDto( repo.save( map.toEntity(d) ) );
    }

    /* ---------- Cập nhật ---------- */
    public CategoryDTO update(Integer id, CategoryDTO d){
        Category c = repo.findById(id)
                         .orElseThrow(() -> new ResourceNotFoundException("Cat "+id));

        c.setNameVn(d.getNameVn());
        c.setNameEn(d.getNameEn());
        /* nếu muốn cho đổi code thì thêm:
           c.setCode(d.getCode());
           nhớ check trùng trước khi set */
        return map.toDto( repo.save(c) );
    }

    public void delete(Integer id){ repo.deleteById(id); }

    /* ---------- Upload icon ---------- */
    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public CategoryDTO uploadIcon(Integer id, MultipartFile file) throws IOException{
        Category c = repo.findById(id)
                         .orElseThrow(() -> new ResourceNotFoundException("Cat "+id));

        Path dir = Paths.get(uploadDir,"cat-icons");
        Files.createDirectories(dir);
        Path p   = dir.resolve(id + "_" + file.getOriginalFilename());

        Files.copy(file.getInputStream(), p, StandardCopyOption.REPLACE_EXISTING);
        c.setIcon(p.getFileName().toString());

        return map.toDto( repo.save(c) );
    }
    
}

