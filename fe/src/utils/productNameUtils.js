/**
 * Get the appropriate product name based on current language with enhanced fallback logic
 * @param {Object} product - Product object from database
 * @param {string} product.name - Vietnamese product name (primary)
 * @param {string} product.nameEn - English product name (from backend)
 * @param {string} currentLanguage - Current language ('en' or 'vi')
 * @returns {Object} - Object with name and translation status
 */
export const getProductName = (product, currentLanguage = 'vi') => {
  if (!product) return { name: '', hasTranslation: false };
  
  // Helper function to check if a value exists and is not null/empty
  const hasValue = (value) => value && value.trim() && value !== 'null' && value !== 'undefined';
  
  // Get available names from backend fields
  const englishName = product.nameEn;        // English name from backend
  const vietnameseName = product.name;       // Vietnamese name from backend
  
  if (currentLanguage === 'en') {
    // User wants English
    if (hasValue(englishName)) {
      return { name: englishName, hasTranslation: true };
    }
    // Fallback to Vietnamese name with indicator
    if (hasValue(vietnameseName)) {
      return { name: vietnameseName, hasTranslation: false };
    }
    // Last resort
    return { name: 'Unnamed Product', hasTranslation: false };
  } else {
    // User wants Vietnamese (default)
    if (hasValue(vietnameseName)) {
      return { name: vietnameseName, hasTranslation: true };
    }
    // Fallback to English name with indicator
    if (hasValue(englishName)) {
      return { name: englishName, hasTranslation: false };
    }
    // Last resort
    return { name: 'Sản phẩm chưa có tên', hasTranslation: false };
  }
};

/**
 * Simple version that returns just the name string (for backward compatibility)
 * @param {Object} product - Product object
 * @param {string} currentLanguage - Current language ('en' or 'vi')
 * @returns {string} - Product name in appropriate language
 */
export const getProductNameSimple = (product, currentLanguage = 'vi') => {
  const result = getProductName(product, currentLanguage);
  return result.name;
};

/**
 * Hook-like function to get product name (for consistency with existing code)
 * @param {string} currentLanguage - Current language
 * @returns {function} - Function to get product names
 */
export const useProductNameTranslation = (currentLanguage = 'vi') => {
  const getProductNameTranslated = (product) => {
    return getProductName(product, currentLanguage);
  };
  
  return { getProductName: getProductNameTranslated };
};

/**
 * Simple function to get product name without hook (for use outside components)
 * @param {Object} product - Product object
 * @param {string} currentLanguage - Current language ('en' or 'vi')
 * @returns {string} - Product name in appropriate language
 */
export const getTranslatedProductName = (product, currentLanguage = 'vi') => {
  return getProductName(product, currentLanguage);
};