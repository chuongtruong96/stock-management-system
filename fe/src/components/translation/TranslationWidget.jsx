// src/components/translation/TranslationWidget.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Tooltip,
  Collapse,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  Close as CloseIcon,
  Language as LanguageIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useUniversalTranslation } from '../../context/UniversalTranslationContext';

const TranslationWidget = () => {
  const {
    translationMode,
    currentLanguage,
    isTranslating,
    toggleTranslationMode,
    changeLanguage,
    startTranslation,
    stopTranslation,
    clearCache,
  } = useUniversalTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleLanguageChange = async (newLang) => {
    if (translationMode) {
      await changeLanguage(newLang);
    } else {
      startTranslation(newLang);
    }
  };

  const handleToggleTranslation = () => {
    if (translationMode) {
      stopTranslation();
    } else {
      toggleTranslationMode();
    }
  };

  if (!isVisible) {
    return (
      <Tooltip title="Show Translation Widget">
        <IconButton
          onClick={() => setIsVisible(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1400,
            bgcolor: '#4285f4',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 20px rgba(66, 133, 244, 0.3)',
            '&:hover': {
              bgcolor: '#3367d6',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <TranslateIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Fade in={isVisible}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1400,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'white',
          border: '1px solid #e0e0e0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 280,
          maxWidth: 320,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: '#4285f4',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TranslateIcon />
            <Typography variant="subtitle1" fontWeight={600}>
              Universal Translate
            </Typography>
            {isTranslating && (
              <CircularProgress size={16} color="inherit" />
            )}
          </Stack>
          
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ color: 'white' }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Hide Widget">
              <IconButton
                size="small"
                onClick={() => setIsVisible(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2 }}>
          {/* Translation Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={translationMode}
                onChange={handleToggleTranslation}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" fontWeight={500}>
                {translationMode ? 'Translation ON' : 'Translation OFF'}
              </Typography>
            }
            sx={{ mb: 2 }}
          />

          {/* Current Language */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Current Language:
            </Typography>
            <Chip
              icon={<LanguageIcon />}
              label={currentLanguage === 'en' ? '🇺🇸 English' : '🇻🇳 Vietnamese'}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>

          <Collapse in={isExpanded}>
            <Stack spacing={2}>
              {/* Language Selection */}
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Translate to:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label="🇺🇸 English"
                    onClick={() => handleLanguageChange('en')}
                    color={currentLanguage === 'en' ? 'primary' : 'default'}
                    variant={currentLanguage === 'en' ? 'filled' : 'outlined'}
                    size="small"
                    clickable
                    disabled={isTranslating}
                  />
                  <Chip
                    label="🇻🇳 Vietnamese"
                    onClick={() => handleLanguageChange('vi')}
                    color={currentLanguage === 'vi' ? 'primary' : 'default'}
                    variant={currentLanguage === 'vi' ? 'filled' : 'outlined'}
                    size="small"
                    clickable
                    disabled={isTranslating}
                  />
                </Stack>
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <Tooltip title="Clear Translation Cache">
                  <IconButton
                    size="small"
                    onClick={clearCache}
                    disabled={isTranslating}
                    sx={{
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' },
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Status */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status: {isTranslating ? 'Translating...' : translationMode ? 'Ready' : 'Inactive'}
                </Typography>
              </Box>
            </Stack>
          </Collapse>

          {/* Quick Actions (always visible) */}
          {!isExpanded && (
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip
                label="🇺🇸 EN"
                onClick={() => handleLanguageChange('en')}
                color={currentLanguage === 'en' ? 'primary' : 'default'}
                size="small"
                clickable
                disabled={isTranslating}
              />
              <Chip
                label="🇻🇳 VI"
                onClick={() => handleLanguageChange('vi')}
                color={currentLanguage === 'vi' ? 'primary' : 'default'}
                size="small"
                clickable
                disabled={isTranslating}
              />
            </Stack>
          )}
        </Box>

        {/* Footer */}
        {translationMode && (
          <Box
            sx={{
              bgcolor: 'grey.50',
              px: 2,
              py: 1,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Powered by LibreTranslate
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default TranslationWidget;