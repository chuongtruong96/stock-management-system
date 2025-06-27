// src/context/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to Vietnamese
    return localStorage.getItem('preferredLanguage') || 'vn';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'vn' ? 'en' : 'vn');
  };

  const getDisplayName = (item) => {
    if (!item) return '';
    
    // For items with both nameVn and nameEn (Categories, Units, Products)
    if (item.nameVn || item.nameEn) {
      if (language === 'vn') {
        return item.nameVn || item.nameEn || '';
      } else {
        return item.nameEn || item.nameVn || '';
      }
    }
    
    // Fallback for legacy 'name' field
    if (item.name) {
      return item.name;
    }
    
    return '';
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    getDisplayName,
    isVietnamese: language === 'vn',
    isEnglish: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};