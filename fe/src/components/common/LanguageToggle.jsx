// src/components/common/LanguageToggle.jsx
import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LanguageToggle = ({ size = 'small', showLabel = false, variant = 'outlined' }) => {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };
  const isEnglish = i18n.language === 'en';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TranslateIcon fontSize="small" />
          Language:
        </Typography>
      )}
      
      <ToggleButtonGroup
        size={size}
        exclusive
        value={i18n.language}
        onChange={(_, newLanguage) => {
          if (newLanguage) {
            if (newLanguage !== i18n.language) {
              i18n.changeLanguage(newLanguage);
            }
          }
        }}
        sx={{
          '& .MuiToggleButton-root': {
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            minWidth: 40,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          },
        }}
      >
      <ToggleButton value="vi" aria-label="Vietnamese">
          <Tooltip title="Tiếng Việt">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🇻🇳
              <Typography variant="caption" fontWeight={isVietnamese ? 600 : 400}>
                VN
              </Typography>
            </Box>
          </Tooltip>
        </ToggleButton>
        
        <ToggleButton value="en" aria-label="English">
          <Tooltip title="English">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🇺🇸
              <Typography variant="caption" fontWeight={isEnglish ? 600 : 400}>
                EN
              </Typography>
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LanguageToggle;