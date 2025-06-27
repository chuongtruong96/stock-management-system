package com.example.stationerymgntbe.controller;

import com.example.stationerymgntbe.dto.ProductDTO;
import com.example.stationerymgntbe.dto.ProductStatsDTO;
import com.example.stationerymgntbe.service.ProductService;
import com.example.stationerymgntbe.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService svc;
    private final TranslationService translationService;

    /* ─────────── LIST ─────────── */

    /** Simplest list for the shop UI */
    @GetMapping("/all")
    public List<ProductDTO> all() {
        return svc.listAll();
    }

    /** Pageable list (optional category filter and search) */
    @GetMapping
    public Page<ProductDTO> list(@RequestParam(required = false) Integer categoryId,
                                 @RequestParam(required = false) String q,
                                 @PageableDefault(size = 40) Pageable pg) {
        return svc.list(pg, categoryId, q);
    }

    @GetMapping("/{id}")
    public ProductDTO byId(@PathVariable Integer id) {
        return svc.getById(id);
    }

    /* ─────────── CRUD ─────────── */

    @PostMapping                 @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO add(@RequestBody @Validated ProductDTO dto) {
        return svc.add(dto);
    }

    @PutMapping("/{id}")         @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO edit(@PathVariable Integer id,
                           @RequestBody @Validated ProductDTO dto) {
        return svc.update(id, dto);
    }

    @DeleteMapping("/{id}")      @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id) {
        svc.delete(id);
    }

    /* ─────────── IMAGE UPLOAD ─────────── */

    @PostMapping(value = "/{id}/image",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO upload(@PathVariable Integer id,
                             @RequestPart("file") MultipartFile file) throws Exception {
        return svc.uploadImage(id, file);
    }

    /* ─────────── CATEGORY FILTER ─────────── */

    @GetMapping("/category/{categoryId}")
    public List<ProductDTO> byCategory(@PathVariable Integer categoryId) {
        return svc.byCategory(categoryId);
    }

    /* ─────────── DASHBOARD STATISTICS ─────────── */

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductStatsDTO getProductStats() {
        return svc.getProductStats();
    }

    @GetMapping("/top-ordered")
    public List<Map<String, Object>> getTopOrderedProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return svc.getTopOrderedProducts(limit);
    }

    @GetMapping("/category-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> getProductCategoryDistribution() {
        return svc.getProductCategoryDistribution();
    }

    /* ─────────── TRANSLATION ─────────── */

    @PostMapping("/translate")
    public Map<String, String> translateProductName(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String targetLang = request.getOrDefault("targetLang", "en");
        
        String translatedText;
        if ("en".equals(targetLang)) {
            translatedText = translationService.translateToEnglish(text);
        } else {
            // For now, we only support Vietnamese to English translation
            // Vietnamese to Vietnamese just returns the original text
            translatedText = text;
        }
        
        return Map.of(
            "originalText", text,
            "translatedText", translatedText != null ? translatedText : text,
            "targetLanguage", targetLang
        );
    }
}
