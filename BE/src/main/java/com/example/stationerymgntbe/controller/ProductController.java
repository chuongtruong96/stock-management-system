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
    public Map<String, String> translateText(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String sourceLang = request.getOrDefault("sourceLang", "auto");
        String targetLang = request.getOrDefault("targetLang", "en");
        
        String translatedText = translationService.translateText(text, sourceLang, targetLang);
        
        return Map.of(
            "originalText", text,
            "translatedText", translatedText != null ? translatedText : text,
            "sourceLanguage", sourceLang,
            "targetLanguage", targetLang
        );
    }

    @PostMapping("/translate/batch")
    public Map<String, Object> batchTranslate(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> texts = (List<String>) request.get("texts");
        String sourceLang = (String) request.getOrDefault("sourceLang", "auto");
        String targetLang = (String) request.getOrDefault("targetLang", "en");
        
        Map<String, String> translations = translationService.batchTranslate(texts, sourceLang, targetLang);
        
        return Map.of(
            "translations", translations,
            "sourceLanguage", sourceLang,
            "targetLanguage", targetLang,
            "count", texts.size()
        );
    }

    @GetMapping("/translate/stats")
    public Map<String, Object> getTranslationStats() {
        return translationService.getCacheStats();
    }

    @PostMapping("/translate/clear-cache")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> clearTranslationCache() {
        translationService.clearCache();
        return Map.of("message", "Translation cache cleared successfully");
    }
}
