// src/main/java/.../controller/ProductController.java
package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.service.ProductService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated                     // ⬅ để kích hoạt @Valid
public class ProductController {

    private final ProductService svc;

    /* ----- CRUD ----- */

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO add(@RequestBody @Validated ProductDTO d){ return svc.add(d); }

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO edit(@PathVariable Integer id,
                           @RequestBody @Validated ProductDTO d){
        return svc.update(id,d);
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public void del(@PathVariable Integer id){ svc.delete(id); }

@GetMapping
public Page<ProductDTO> list(@RequestParam(required=false) Integer categoryId,
                             @PageableDefault(size = 40) Pageable pageable){
    if(categoryId!=null) return svc.pageByCategory(categoryId,pageable);
    return svc.pageByCategory(null,pageable);           // all
}

@GetMapping("/{id}")
public ProductDTO byId(@PathVariable Integer id){
    return svc.getProductById(id);
}
    /* ----- UPLOAD IMAGE ----- */
    @PostMapping(value="/{id}/image",
                 consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO upload(@PathVariable Integer id,
                             @RequestPart("file") MultipartFile f) throws Exception{
        return svc.uploadImage(id,f);
    }
}
