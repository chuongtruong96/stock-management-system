package com.example.stationerymgntbe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TranslationService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Free LibreTranslate API (you can self-host or use public instance)
    private static final String LIBRE_TRANSLATE_URL = "https://libretranslate.de/translate";
    
    // Manual translations for important/technical terms
    private static final Map<String, String> MANUAL_TRANSLATIONS = Map.ofEntries(
        // Staplers and clips
        Map.entry("Kim bấm", "Stapler"),
        Map.entry("Kẹp đen bướm", "Black Butterfly Clip"),
        Map.entry("Kẹp ghim giấy", "Paper Clip"),
        Map.entry("Máy bấm", "Stapler Machine"),
        
        // Tapes and adhesives
        Map.entry("Băng keo", "Tape"),
        Map.entry("Băng keo 2 mặt", "Double-sided Tape"),
        Map.entry("Băng keo dán gáy sách", "Book Spine Tape"),
        Map.entry("Băng keo giấy", "Paper Tape"),
        
        // Envelopes and files
        Map.entry("Bao thư", "Envelope"),
        Map.entry("Bìa còng", "Ring Binder"),
        Map.entry("Bìa hồ sơ", "File Folder"),
        
        // Common terms
        Map.entry("trắng", "White"),
        Map.entry("đen", "Black"),
        Map.entry("trong", "Transparent"),
        Map.entry("mỏng", "Thin"),
        Map.entry("dày", "Thick"),
        Map.entry("nhựa", "Plastic"),
        Map.entry("giấy", "Paper")
    );

    /**
     * Translate Vietnamese to English using hybrid approach
     * 1. Check manual translations first (for technical terms)
     * 2. Use free auto-translation for remaining text
     * 3. Apply post-processing for common patterns
     */
    public String translateToEnglish(String vietnameseText) {
        if (vietnameseText == null || vietnameseText.trim().isEmpty()) {
            return vietnameseText;
        }

        try {
            // Step 1: Apply manual translations for technical terms
            String result = applyManualTranslations(vietnameseText);
            
            // Step 2: If significantly changed by manual translation, return it
            if (!result.equals(vietnameseText) && isGoodTranslation(result)) {
                return cleanupTranslation(result);
            }
            
            // Step 3: Use free auto-translation
            String autoTranslated = translateWithLibreTranslate(vietnameseText);
            if (autoTranslated != null && !autoTranslated.equals(vietnameseText)) {
                return cleanupTranslation(autoTranslated);
            }
            
            // Step 4: Fallback to manual translation result
            return cleanupTranslation(result);
            
        } catch (Exception e) {
            log.warn("Translation failed for '{}': {}", vietnameseText, e.getMessage());
            // Fallback: return manual translation or original text
            return applyManualTranslations(vietnameseText);
        }
    }

    /**
     * Apply manual translations for technical terms
     */
    private String applyManualTranslations(String text) {
        String result = text;
        
        // Apply manual translations
        for (Map.Entry<String, String> entry : MANUAL_TRANSLATIONS.entrySet()) {
            result = result.replaceAll("(?i)" + entry.getKey(), entry.getValue());
        }
        
        // Handle common patterns
        result = result.replaceAll("(\\d+)\\s*mm", "$1mm");
        result = result.replaceAll("(\\d+)\\s*cm", "$1cm");
        result = result.replaceAll("\\((.*?)\\)", "($1)");
        
        return result;
    }

    /**
     * Translate using free LibreTranslate API
     */
    private String translateWithLibreTranslate(String text) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("q", text);
            requestBody.put("source", "vi");
            requestBody.put("target", "en");
            requestBody.put("format", "text");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
            LIBRE_TRANSLATE_URL, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            return (String) responseBody.get("translatedText");
            }
            
        } catch (Exception e) {
            log.debug("LibreTranslate API failed: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * Check if translation looks good
     */
    private boolean isGoodTranslation(String translation) {
        // Basic quality checks
        return translation != null 
            && !translation.trim().isEmpty()
            && translation.length() > 2
            && !translation.equals("null")
            && !translation.contains("ERROR");
    }

    /**
     * Clean up translation result
     */
    private String cleanupTranslation(String translation) {
        return translation
            .replaceAll("\\s+", " ")  // Multiple spaces to single space
            .replaceAll("\\s*([(),])", "$1")  // Remove spaces before punctuation
            .replaceAll("([(),])\\s*", "$1 ")  // Add space after punctuation
            .trim();
    }

    /**
     * Get translation for common product categories
     */
    public String translateProductCategory(String vietnameseCategory) {
        Map<String, String> categoryTranslations = Map.of(
            "Băng keo & Keo dán", "Adhesives & Tapes",
            "Bao thư & Phong bì", "Envelopes",
            "Bìa / File / Trang ký", "Files & Folders",
            "Bút bi & Bút mực", "Ball-point & Gel Pens",
            "Bút viết bảng", "Whiteboard Markers",
            "Bút chì & Ruột chì", "Pencils & Leads",
            "Bút dạ quang / Marker", "Highlighters",
            "Gôm / Xoá / Correction", "Erasers & Correction",
            "Cắt, Dao, Kéo & Lỗ đục", "Cutting & Punching",
            "Kẹp, Kim, Ghim & Bấm", "Clips & Staplers"
        );
        
        return categoryTranslations.getOrDefault(vietnameseCategory, 
            translateToEnglish(vietnameseCategory));
    }

    /**
     * Batch translate multiple products efficiently
     */
    public Map<String, String> batchTranslate(List<String> vietnameseTexts) {
        Map<String, String> results = new HashMap<>();
        
        for (String text : vietnameseTexts) {
            results.put(text, translateToEnglish(text));
            
            // Add small delay to be respectful to free API
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        return results;
    }
}