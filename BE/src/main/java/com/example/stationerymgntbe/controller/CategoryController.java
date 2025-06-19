package com.example.stationerymgntbe.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.stationerymgntbe.dto.CategoryDTO;
import com.example.stationerymgntbe.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService srv;

    @GetMapping 
    public List<CategoryDTO> list(){ return srv.all(); }

    @GetMapping("/{id}")
    public CategoryDTO getById(@PathVariable Integer id) {
        return srv.all().stream()
                .filter(cat -> cat.getCategoryId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public CategoryDTO add(@RequestBody CategoryDTO d){ return srv.create(d); }

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public CategoryDTO edit(@PathVariable Integer id,@RequestBody CategoryDTO d){
        return srv.update(id,d);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public void del(@PathVariable Integer id){ srv.delete(id); }

    @PostMapping(value="/{id}/icon",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryDTO icon(@PathVariable Integer id,
                            @RequestPart("file") MultipartFile f) throws IOException{
        return srv.uploadIcon(id,f);
    }
}
