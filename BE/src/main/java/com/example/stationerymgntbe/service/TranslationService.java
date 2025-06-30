package com.example.stationerymgntbe.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class TranslationService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Google Translate API - much faster and more accurate
    private static final String GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";
    
    // Aggressive caching for performance - like Google Translate extension
    private final Map<String, String> translationCache = new ConcurrentHashMap<>();
    
    @Value("${google.translate.api.key:}")
    private String googleApiKey;
    
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
     * Translate text using Google Translate API with aggressive caching
     * Much faster and more accurate than LibreTranslate - works like Google Translate extension
     */
    public String translateToEnglish(String vietnameseText) {
        return translateText(vietnameseText, "vi", "en");
    }

    /**
     * Translate text from any language to any language using Google Translate
     * This is the main translation method that works like Google Translate extension
     */
    public String translateText(String text, String sourceLang, String targetLang) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        String cacheKey = sourceLang + "_" + targetLang + "_" + text;
        
        // Check cache first for instant response (like Google Translate)
        if (translationCache.containsKey(cacheKey)) {
            return translationCache.get(cacheKey);
        }

        try {
            // Step 1: Apply manual translations for technical terms (Vietnamese to English only)
            if ("vi".equals(sourceLang) && "en".equals(targetLang)) {
                String manualResult = applyManualTranslations(text);
                if (!manualResult.equals(text) && isGoodTranslation(manualResult)) {
                    String cleaned = cleanupTranslation(manualResult);
                    translationCache.put(cacheKey, cleaned);
                    return cleaned;
                }
            }
            
            // Step 2: Use Google Translate API (much faster than LibreTranslate)
            String googleTranslated = translateWithGoogleTranslate(text, sourceLang, targetLang);
            if (googleTranslated != null && !googleTranslated.equals(text)) {
                String cleaned = cleanupTranslation(googleTranslated);
                translationCache.put(cacheKey, cleaned);
                return cleaned;
            }
            
            // Step 3: Fallback
            translationCache.put(cacheKey, text);
            return text;
            
        } catch (Exception e) {
            log.warn("Translation failed for '{}' from {} to {}: {}", text, sourceLang, targetLang, e.getMessage());
            // Fallback: cache and return original text
            translationCache.put(cacheKey, text);
            return text;
        }
    }

    /**
     * Translate using Google Translate API (free endpoint)
     * This uses the same endpoint as Google Translate website - very fast and accurate
     * Enhanced with proper Vietnamese Unicode handling
     */
    private String translateWithGoogleTranslate(String text, String sourceLang, String targetLang) {
        try {
            // Normalize Vietnamese text for better translation
            String normalizedText = normalizeVietnameseText(text);
            
            // Use proper UTF-8 encoding for Vietnamese characters
            String encodedText = URLEncoder.encode(normalizedText, StandardCharsets.UTF_8);
            String url = String.format(
                "%s?client=gtx&sl=%s&tl=%s&dt=t&ie=UTF-8&oe=UTF-8&q=%s",
                GOOGLE_TRANSLATE_URL, sourceLang, targetLang, encodedText
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            headers.set("Accept-Language", "vi-VN,vi;q=0.9,en;q=0.8");
            headers.set("Accept-Charset", "UTF-8");
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, 
                org.springframework.http.HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseGoogleTranslateResponse(response.getBody());
            }
            
        } catch (Exception e) {
            log.debug("Google Translate API failed: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * Normalize Vietnamese text for better translation
     * Handles Unikey input and various Vietnamese encoding issues
     */
    private String normalizeVietnameseText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Normalize Unicode to NFC form (canonical composition)
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFC);
        
        // Handle common Vietnamese character encoding issues
        normalized = normalized
            // Fix common encoding issues
            .replace("Ä'", "đ")
            .replace("Ã¡", "á")
            .replace("Ã ", "à")
            .replace("Ã¢", "â")
            .replace("Ã£", "ã")
            .replace("Ä", "ă")
            // Ensure proper Vietnamese characters
            .replace("a\u0300", "à")  // a + grave accent
            .replace("a\u0301", "á")  // a + acute accent
            .replace("a\u0303", "ã")  // a + tilde
            .replace("a\u0309", "ả")  // a + hook above
            .replace("a\u0323", "ạ")  // a + dot below
            // Similar for other vowels
            .replace("e\u0300", "è")
            .replace("e\u0301", "é")
            .replace("e\u0303", "ẽ")
            .replace("e\u0309", "ẻ")
            .replace("e\u0323", "ẹ")
            .replace("i\u0300", "ì")
            .replace("i\u0301", "í")
            .replace("i\u0303", "ĩ")
            .replace("i\u0309", "ỉ")
            .replace("i\u0323", "ị")
            .replace("o\u0300", "ò")
            .replace("o\u0301", "ó")
            .replace("o\u0303", "õ")
            .replace("o\u0309", "ỏ")
            .replace("o\u0323", "ọ")
            .replace("u\u0300", "ù")
            .replace("u\u0301", "ú")
            .replace("u\u0303", "ũ")
            .replace("u\u0309", "ủ")
            .replace("u\u0323", "ụ")
            .replace("y\u0300", "ỳ")
            .replace("y\u0301", "ý")
            .replace("y\u0303", "ỹ")
            .replace("y\u0309", "ỷ")
            .replace("y\u0323", "ỵ");
        
        return normalized;
    }

    /**
     * Parse Google Translate API response
     * The response is a JSON array with the translated text
     */
    private String parseGoogleTranslateResponse(String responseBody) {
        try {
            // Google Translate returns: [[["translated text","original text",null,null,3]],null,"vi"]
            // We need to extract the first translated text
            Pattern pattern = Pattern.compile("\\[\\[\\[\"([^\"]+)\"");
            Matcher matcher = pattern.matcher(responseBody);
            
            if (matcher.find()) {
                return matcher.group(1)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"")
                    .replace("\\\\", "\\");
            }
        } catch (Exception e) {
            log.debug("Failed to parse Google Translate response: {}", e.getMessage());
        }
        
        return null;
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
     * Batch translate multiple texts efficiently with caching
     * Much faster than individual requests
     */
    public Map<String, String> batchTranslate(List<String> texts, String sourceLang, String targetLang) {
        Map<String, String> results = new HashMap<>();
        
        for (String text : texts) {
            results.put(text, translateText(text, sourceLang, targetLang));
            // No delay needed with caching and Google Translate API
        }
        
        return results;
    }

    /**
     * Batch translate Vietnamese texts to English (backward compatibility)
     */
    public Map<String, String> batchTranslate(List<String> vietnameseTexts) {
        return batchTranslate(vietnameseTexts, "vi", "en");
    }

    /**
     * Clear translation cache (useful for testing or memory management)
     */
    public void clearCache() {
        translationCache.clear();
        log.info("Translation cache cleared");
    }

    /**
     * Get cache statistics
     */
    public Map<String, Object> getCacheStats() {
        return Map.of(
            "cacheSize", translationCache.size(),
            "cacheKeys", translationCache.keySet().size()
        );
    }
}