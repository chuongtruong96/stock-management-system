// src/context/UniversalTranslationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translationApi } from '../services/api';

const UniversalTranslationContext = createContext();

export const useUniversalTranslation = () => {
  const context = useContext(UniversalTranslationContext);
  if (!context) {
    throw new Error('useUniversalTranslation must be used within a UniversalTranslationProvider');
  }
  return context;
};

export const UniversalTranslationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState(new Map());
  const [originalTexts, setOriginalTexts] = useState(new Map());
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [translationMode, setTranslationMode] = useState(false);
  const observerRef = useRef(null);
  const translationQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  // Language detection helper
  const detectLanguage = useCallback((text) => {
    if (!text || text.trim().length < 3) return 'unknown';
    
    // Vietnamese characters pattern
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    // English common words
    const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by|a|an|is|are|was|were|be|been|have|has|had|do|does|did|will|would|could|should|may|might|can|must)\b/i;
    
    // Vietnamese common words
    const vietnameseWords = /\b(và|hoặc|nhưng|trong|trên|tại|để|cho|của|với|bởi|là|có|đã|sẽ|sẽ|có thể|nên|phải|được|này|đó|những|các|một|hai|ba)\b/i;
    
    if (vietnamesePattern.test(text) || vietnameseWords.test(text)) {
      return 'vi';
    } else if (englishWords.test(text)) {
      return 'en';
    }
    
    // Default to Vietnamese if uncertain (since most content is Vietnamese)
    return 'vi';
  }, []);

  // Check if text should be translated
  const shouldTranslate = useCallback((text, targetLang) => {
    if (!text || text.trim().length < 2) return false;
    
    // Don't translate numbers, dates, or special characters only
    if (/^[\d\s\-\/\.\,\:\;\!\?\(\)\[\]]+$/.test(text)) return false;
    
    // Don't translate single characters or very short text
    if (text.trim().length < 3) return false;
    
    const detectedLang = detectLanguage(text);
    
    // Only translate if detected language is different from target
    return detectedLang !== targetLang && detectedLang !== 'unknown';
  }, [detectLanguage]);

  // Translate text using API
  const translateText = useCallback(async (text, targetLang) => {
    if (!shouldTranslate(text, targetLang)) return text;
    
    const cacheKey = `${text.trim()}_${targetLang}`;
    
    // Check cache first
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }
    
    try {
      const translated = await translationApi.translateText(text.trim(), targetLang);
      
      // Cache the result
      setTranslationCache(prev => new Map(prev.set(cacheKey, translated)));
      
      return translated;
    } catch (error) {
      console.warn('Translation failed for:', text, error);
      return text;
    }
  }, [shouldTranslate, translationCache]);

  // Process translation queue
  const processTranslationQueue = useCallback(async () => {
    if (isProcessingRef.current || translationQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    setIsTranslating(true);
    
    const queue = [...translationQueueRef.current];
    translationQueueRef.current = [];
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < queue.length; i += batchSize) {
      const batch = queue.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async ({ element, originalText, targetLang }) => {
        try {
          const translatedText = await translateText(originalText, targetLang);
          
          // Update the element if it still exists and hasn't changed
          if (element && element.isConnected && element.textContent.trim() === originalText.trim()) {
            element.textContent = translatedText;
          }
        } catch (error) {
          console.warn('Failed to translate element:', error);
        }
      }));
      
      // Small delay between batches
      if (i + batchSize < queue.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    isProcessingRef.current = false;
    setIsTranslating(false);
  }, [translateText]);

  // Find and translate text nodes
  const translateTextNodes = useCallback((rootElement, targetLang) => {
    if (!rootElement || !translationMode) return;
    
    const walker = document.createTreeWalker(
      rootElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and other non-visible elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'meta', 'title'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip if parent is hidden
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only process text nodes with meaningful content
          const text = node.textContent.trim();
          if (text.length < 2) return NodeFilter.FILTER_REJECT;
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // Store original texts and queue for translation
    textNodes.forEach(textNode => {
      const originalText = textNode.textContent.trim();
      const element = textNode.parentElement;
      
      if (originalText && shouldTranslate(originalText, targetLang)) {
        // Store original text if not already stored
        if (!originalTexts.has(element)) {
          setOriginalTexts(prev => new Map(prev.set(element, originalText)));
        }
        
        // Add to translation queue
        translationQueueRef.current.push({
          element: textNode,
          originalText,
          targetLang
        });
      }
    });
    
    // Process the queue
    processTranslationQueue();
  }, [translationMode, shouldTranslate, processTranslationQueue, originalTexts]);

  // Restore original texts
  const restoreOriginalTexts = useCallback(() => {
    originalTexts.forEach((originalText, element) => {
      if (element && element.isConnected) {
        // Find the text node within the element
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let textNode = walker.nextNode();
        if (textNode) {
          textNode.textContent = originalText;
        }
      }
    });
  }, [originalTexts]);

  // Set up mutation observer to handle dynamic content
  useEffect(() => {
    if (!translationMode) return;
    
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              translateTextNodes(node, currentLanguage);
            }
          });
        }
      });
    });
    
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [translationMode, currentLanguage, translateTextNodes]);

  // Toggle translation mode
  const toggleTranslationMode = useCallback(() => {
    setTranslationMode(prev => !prev);
  }, []);

  // Change language and translate page
  const changeLanguage = useCallback(async (newLang) => {
    if (newLang === currentLanguage) return;
    
    setCurrentLanguage(newLang);
    await i18n.changeLanguage(newLang);
    
    if (translationMode) {
      // Clear cache for new language
      setTranslationCache(new Map());
      
      // If switching back to original language, restore original texts
      if (newLang === 'vi') {
        restoreOriginalTexts();
      } else {
        // Translate entire page to new language
        translateTextNodes(document.body, newLang);
      }
    }
  }, [currentLanguage, i18n, translationMode, restoreOriginalTexts, translateTextNodes]);

  // Start translation mode
  const startTranslation = useCallback((targetLang) => {
    setTranslationMode(true);
    setCurrentLanguage(targetLang);
    translateTextNodes(document.body, targetLang);
  }, [translateTextNodes]);

  // Stop translation mode
  const stopTranslation = useCallback(() => {
    setTranslationMode(false);
    restoreOriginalTexts();
    setOriginalTexts(new Map());
    setTranslationCache(new Map());
  }, [restoreOriginalTexts]);

  const value = {
    // Translation state
    isTranslating,
    translationMode,
    currentLanguage,
    
    // Translation controls
    toggleTranslationMode,
    changeLanguage,
    startTranslation,
    stopTranslation,
    
    // Manual translation
    translateText,
    
    // Utilities
    isVietnamese: currentLanguage === 'vi',
    isEnglish: currentLanguage === 'en',
    
    // Cache management
    translationCache,
    clearCache: () => setTranslationCache(new Map()),
  };

  return (
    <UniversalTranslationContext.Provider value={value}>
      {children}
    </UniversalTranslationContext.Provider>
  );
};