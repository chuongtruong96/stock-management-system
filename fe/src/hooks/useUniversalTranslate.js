// src/hooks/useUniversalTranslate.js
import { useState, useEffect, useCallback } from 'react';
import { useUniversalTranslation } from '../context/UniversalTranslationContext';

/**
 * Hook for translating text with the universal translation system
 * @param {string} text - Text to translate
 * @param {object} options - Translation options
 * @returns {object} - { translatedText, isLoading, error }
 */
export const useUniversalTranslate = (text, options = {}) => {
  const { 
    translateText, 
    currentLanguage, 
    translationMode 
  } = useUniversalTranslation();
  
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    targetLanguage = currentLanguage,
    autoTranslate = true,
    fallbackToOriginal = true,
  } = options;

  const performTranslation = useCallback(async () => {
    if (!text || !autoTranslate || !translationMode) {
      setTranslatedText(text);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await translateText(text, targetLanguage);
      setTranslatedText(result);
    } catch (err) {
      setError(err);
      if (fallbackToOriginal) {
        setTranslatedText(text);
      }
    } finally {
      setIsLoading(false);
    }
  }, [text, targetLanguage, autoTranslate, translationMode, translateText, fallbackToOriginal]);

  useEffect(() => {
    performTranslation();
  }, [performTranslation]);

  return {
    translatedText,
    isLoading,
    error,
    retranslate: performTranslation,
  };
};

/**
 * Hook for translating multiple texts at once
 * @param {string[]} texts - Array of texts to translate
 * @param {object} options - Translation options
 * @returns {object} - { translatedTexts, isLoading, errors }
 */
export const useUniversalTranslateMultiple = (texts, options = {}) => {
  const { translateText, currentLanguage, translationMode } = useUniversalTranslation();
  
  const [translatedTexts, setTranslatedTexts] = useState(texts);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const {
    targetLanguage = currentLanguage,
    autoTranslate = true,
    fallbackToOriginal = true,
    batchSize = 5,
  } = options;

  const performTranslations = useCallback(async () => {
    if (!texts.length || !autoTranslate || !translationMode) {
      setTranslatedTexts(texts);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const results = [];
      const batchErrors = [];

      // Process in batches to avoid overwhelming the API
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (text, index) => {
          try {
            const result = await translateText(text, targetLanguage);
            return { index: i + index, result };
          } catch (error) {
            batchErrors.push({ index: i + index, error });
            return { index: i + index, result: fallbackToOriginal ? text : '' };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Small delay between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Sort results by original index
      results.sort((a, b) => a.index - b.index);
      setTranslatedTexts(results.map(r => r.result));
      setErrors(batchErrors);

    } catch (err) {
      setErrors([{ error: err }]);
      if (fallbackToOriginal) {
        setTranslatedTexts(texts);
      }
    } finally {
      setIsLoading(false);
    }
  }, [texts, targetLanguage, autoTranslate, translationMode, translateText, fallbackToOriginal, batchSize]);

  useEffect(() => {
    performTranslations();
  }, [performTranslations]);

  return {
    translatedTexts,
    isLoading,
    errors,
    retranslate: performTranslations,
  };
};

/**
 * Hook for translating object properties
 * @param {object} obj - Object with text properties to translate
 * @param {string[]} properties - Array of property names to translate
 * @param {object} options - Translation options
 * @returns {object} - { translatedObject, isLoading, errors }
 */
export const useUniversalTranslateObject = (obj, properties = [], options = {}) => {
  const { translateText, currentLanguage, translationMode } = useUniversalTranslation();
  
  const [translatedObject, setTranslatedObject] = useState(obj);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const {
    targetLanguage = currentLanguage,
    autoTranslate = true,
    fallbackToOriginal = true,
  } = options;

  const performObjectTranslation = useCallback(async () => {
    if (!obj || !properties.length || !autoTranslate || !translationMode) {
      setTranslatedObject(obj);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const translatedProps = {};
      const propErrors = {};

      await Promise.all(properties.map(async (prop) => {
        if (obj[prop]) {
          try {
            const result = await translateText(obj[prop], targetLanguage);
            translatedProps[prop] = result;
          } catch (error) {
            propErrors[prop] = error;
            if (fallbackToOriginal) {
              translatedProps[prop] = obj[prop];
            }
          }
        }
      }));

      setTranslatedObject({ ...obj, ...translatedProps });
      setErrors(propErrors);

    } catch (err) {
      setErrors({ general: err });
      if (fallbackToOriginal) {
        setTranslatedObject(obj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [obj, properties, targetLanguage, autoTranslate, translationMode, translateText, fallbackToOriginal]);

  useEffect(() => {
    performObjectTranslation();
  }, [performObjectTranslation]);

  return {
    translatedObject,
    isLoading,
    errors,
    retranslate: performObjectTranslation,
  };
};