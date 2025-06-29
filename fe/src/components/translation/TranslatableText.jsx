// src/components/translation/TranslatableText.jsx
import React from 'react';
import { Typography, Box, Skeleton } from '@mui/material';
import { useUniversalTranslate } from '../../hooks/useUniversalTranslate';

/**
 * Component that automatically translates its text content
 * @param {object} props - Component props
 * @param {string} props.children - Text to translate
 * @param {string} props.component - MUI Typography component variant
 * @param {object} props.sx - MUI sx prop for styling
 * @param {object} props.translationOptions - Translation options
 * @returns {JSX.Element} - Translatable text component
 */
const TranslatableText = ({ 
  children, 
  component = 'body1', 
  sx = {}, 
  translationOptions = {},
  ...props 
}) => {
  const { translatedText, isLoading } = useUniversalTranslate(children, translationOptions);

  if (isLoading) {
    return (
      <Skeleton 
        variant="text" 
        width="80%" 
        sx={{ 
          fontSize: component.includes('h') ? '2rem' : '1rem',
          ...sx 
        }} 
      />
    );
  }

  return (
    <Typography 
      variant={component} 
      sx={sx} 
      {...props}
    >
      {translatedText}
    </Typography>
  );
};

/**
 * Higher-order component that makes any component translatable
 * @param {React.Component} WrappedComponent - Component to make translatable
 * @returns {React.Component} - Enhanced component with translation
 */
export const withTranslation = (WrappedComponent) => {
  return function TranslatableComponent(props) {
    const { text, translationOptions, ...otherProps } = props;
    const { translatedText, isLoading } = useUniversalTranslate(text, translationOptions);

    return (
      <WrappedComponent 
        {...otherProps} 
        text={translatedText}
        isTranslating={isLoading}
      />
    );
  };
};

/**
 * Component for translating object properties
 * @param {object} props - Component props
 * @param {object} props.data - Object with properties to translate
 * @param {string[]} props.properties - Array of property names to translate
 * @param {function} props.children - Render function that receives translated data
 * @returns {JSX.Element} - Rendered content with translated data
 */
export const TranslatableObject = ({ data, properties, children, translationOptions = {} }) => {
  const { useUniversalTranslateObject } = require('../../hooks/useUniversalTranslate');
  const { translatedObject, isLoading } = useUniversalTranslateObject(data, properties, translationOptions);

  return children({ data: translatedObject, isLoading });
};

export default TranslatableText;