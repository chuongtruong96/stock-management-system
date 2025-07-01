/**
 * Get the appropriate category name based on current language with enhanced fallback logic
 * @param {Object} category - Category object from database
 * @param {string} category.name - Vietnamese category name (legacy)
 * @param {string} category.name_en - English category name
 * @param {string} category.name_vn - Vietnamese category name
 * @param {string} category.nameEn - English category name (camelCase, if backend converts)
 * @param {string} category.nameVn - Vietnamese category name (camelCase, if backend converts)
 * @param {string} category.code - Category code (fallback)
 * @param {string} currentLanguage - Current language ('en' or 'vi')
 * @returns {Object} - Object with name and translation status
 */
export const getCategoryName = (category, currentLanguage = 'vi') => {
  if (!category) return { name: '', hasTranslation: false };
  
  // Helper function to check if a value exists and is not null/empty
  const hasValue = (value) => value && value.trim() && value !== 'null' && value !== 'undefined';
  
  // Get available names from backend fields (categories use nameEn/nameVn)
  const englishName = category.nameEn;       // English name from backend
  const vietnameseName = category.nameVn;    // Vietnamese name from backend
  const categoryCode = category.code;        // Category code fallback
  
  if (currentLanguage === 'en') {
    // User wants English
    if (hasValue(englishName)) {
      return { name: englishName, hasTranslation: true };
    }
    // Fallback to Vietnamese name with indicator
    if (hasValue(vietnameseName)) {
      return { name: vietnameseName, hasTranslation: false };
    }
    // Fallback to code
    if (hasValue(categoryCode)) {
      return { name: categoryCode, hasTranslation: false };
    }
    // Last resort
    return { name: 'Unnamed Category', hasTranslation: false };
  } else {
    // User wants Vietnamese (default)
    if (hasValue(vietnameseName)) {
      return { name: vietnameseName, hasTranslation: true };
    }
    // Fallback to English name with indicator
    if (hasValue(englishName)) {
      return { name: englishName, hasTranslation: false };
    }
    // Fallback to code
    if (hasValue(categoryCode)) {
      return { name: categoryCode, hasTranslation: false };
    }
    // Last resort
    return { name: 'Danh mục chưa có tên', hasTranslation: false };
  }
};

/**
 * Simple version that returns just the name string (for backward compatibility)
 * @param {Object} category - Category object
 * @param {string} currentLanguage - Current language ('en' or 'vi')
 * @returns {string} - Category name in appropriate language
 */
export const getCategoryNameSimple = (category, currentLanguage = 'vi') => {
  const result = getCategoryName(category, currentLanguage);
  return result.name;
};

/**
 * Hook-like function to get category name (for consistency with existing code)
 * @param {string} currentLanguage - Current language
 * @returns {function} - Function to get category names
 */
export const useCategoryNameTranslation = (currentLanguage = 'vi') => {
  const getCategoryNameTranslated = (category) => {
    return getCategoryName(category, currentLanguage);
  };
  
  return { getCategoryName: getCategoryNameTranslated };
};

/**
 * Simple function to get category name without hook (for use outside components)
 * @param {Object} category - Category object
 * @param {string} currentLanguage - Current language ('en' or 'vi')
 * @returns {string} - Category name in appropriate language
 */
export const getTranslatedCategoryName = (category, currentLanguage = 'vi') => {
  return getCategoryName(category, currentLanguage);
};