package com.example.stationerymgntbe.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
    
    @Autowired
    private CloudinaryService cloudinaryService;

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
    public CategoryDTO uploadIcon(Integer id, MultipartFile file) throws IOException{
        Category c = repo.findById(id)
                         .orElseThrow(() -> new ResourceNotFoundException("Cat "+id));

        /* --- VALIDATION --- */
        if (file.isEmpty()) throw new IllegalStateException("Empty file");

        if (!file.getContentType().startsWith("image/"))
            throw new IllegalStateException("Only image files allowed");

        if (file.getSize() > 5 * 1024 * 1024) // 5 MB
            throw new IllegalStateException("File too large (>5MB)");

        /* --- UPLOAD TO CLOUDINARY --- */
        try {
            // Delete old icon if exists
            if (c.getIcon() != null && c.getIcon().startsWith("https://res.cloudinary.com/")) {
                String publicId = cloudinaryService.extractPublicId(c.getIcon());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            }
            
            // Upload new icon with category ID as public ID
            String cloudinaryUrl = cloudinaryService.uploadImage(
                file, 
                "stationery-mgmt/categories", 
                id.toString()
            );
            
            c.setIcon(cloudinaryUrl);
            
            return map.toDto(repo.save(c));
            
        } catch (Exception e) {
            throw new IOException("Failed to upload icon to Cloudinary: " + e.getMessage(), e);
        }
    }
    
}

