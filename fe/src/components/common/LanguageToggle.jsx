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
import { useUniversalTranslation } from '../../context/UniversalTranslationContext';

const LanguageToggle = ({ size = 'small', showLabel = false, variant = 'outlined' }) => {
  const { currentLanguage, toggleLanguage } = useUniversalTranslation();
  const isVietnamese = currentLanguage === 'vi';
  const isEnglish = currentLanguage === 'en';

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
        value={currentLanguage}
        onChange={(_, newLanguage) => {
          if (newLanguage) {
            if (newLanguage !== currentLanguage) {
              toggleLanguage();
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