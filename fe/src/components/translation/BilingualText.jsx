// src/components/translation/BilingualText.jsx
import React from 'react';
import { Typography, Skeleton } from '@mui/material';
import { useTranslation } from "react-i18next";
import { getProductName } from 'utils/productNameUtils';

/**
 * Component that displays bilingual content from database fields
 * Automatically selects the appropriate language version based on current language
 * Falls back to translation if the target language version is not available
 * 
 * @param {object} props - Component props
 * @param {string} props.en - English text (from nameEn, descriptionEn, etc.)
 * @param {string} props.vi - Vietnamese text (from nameVn, descriptionVn, etc.)
 * @param {string} props.fallback - Fallback text if both en/vi are empty
 * @param {string} props.component - MUI Typography component variant
 * @param {object} props.sx - MUI sx prop for styling
 * @param {object} props.product - Product object (for product names)
 * @returns {JSX.Element} - Bilingual text component
 */
const BilingualText = ({ 
  en, 
  vi, 
  fallback = 'No content available',
  component = 'body1', 
  sx = {}, 
  product = null, // Product object for product names
  ...props 
}) => {
  const { i18n } = useTranslation();

  // Determine the display text
  let displayText;

  if (product) {
    // For product names, use the database fields
    displayText = getProductName(product, i18n.language);
  } else {
    // Original bilingual logic for other content
    const primaryText = i18n.language === 'vi' ? vi : en;
    const fallbackText = i18n.language === 'vi' ? en : vi;
    displayText = primaryText || fallbackText || fallback;
  }

  return (
    <Typography 
      variant={component} 
      sx={sx} 
      {...props}
    >
      {displayText}
    </Typography>
  );
};

/**
 * Hook for getting bilingual text content
 * @param {string} en - English text
 * @param {string} vi - Vietnamese text
 * @param {string} fallback - Fallback text
 * @param {object} options - Translation options
 * @returns {object} - { text, isLoading, language }
 */
export const useBilingualText = (en, vi, fallback = '', options = {}) => {
  const { i18n } = useTranslation();

  const primaryText = i18n.language === 'vi' ? vi : en;
  const fallbackText = i18n.language === 'vi' ? en : vi;
  const availableText = primaryText || fallbackText || fallback;

  return {
    text: availableText,
    isLoading: false,
    language: primaryText ? i18n.language : (fallbackText === en ? 'en' : 'vi'),
    isTranslated: false,
  };
};

/**
 * Component for handling bilingual objects with multiple properties
 * @param {object} props - Component props
 * @param {object} props.data - Object with bilingual properties
 * @param {string[]} props.properties - Array of property base names (e.g., ['name', 'description'])
 * @param {function} props.children - Render function that receives processed data
 * @returns {JSX.Element} - Rendered content with bilingual data
 */
export const BilingualObject = ({ data, properties, children, options = {} }) => {
  const { i18n } = useTranslation();
  const [processedData, setProcessedData] = React.useState(data);

  React.useEffect(() => {
    if (!data || !properties.length) {
      setProcessedData(data);
      return;
    }

    const processed = { ...data };
    
    properties.forEach(prop => {
      const enProp = `${prop}En`;
      const viProp = `${prop}Vn`;
      const enValue = data[enProp];
      const viValue = data[viProp];
      
      // Set the display value based on current language
      const primaryValue = i18n.language === 'vi' ? viValue : enValue;
      const fallbackValue = i18n.language === 'vi' ? enValue : viValue;
      
      processed[prop] = primaryValue || fallbackValue || '';
      processed[`${prop}Language`] = primaryValue ? i18n.language : (fallbackValue ? (fallbackValue === enValue ? 'en' : 'vi') : 'none');
    });

    setProcessedData(processed);
  }, [data, properties, i18n.language]);

  return children({ data: processedData, isLoading: false });
};

export default BilingualText;