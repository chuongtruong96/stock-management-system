import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  NotificationsNone as NotificationsIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const EmptyState = ({ hasSearch, onClearSearch, onRefresh }) => {
  const { t } = useTranslation('notifications');
  const theme = useTheme();

  const EmptyIllustration = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          mx: 'auto'
        }}
      >
        {hasSearch ? (
          <SearchIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
        ) : (
          <NotificationsIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
        )}
      </Box>
    </motion.div>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <EmptyIllustration />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {hasSearch ? t('noSearchResults') : t('noNotifications')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          {hasSearch 
            ? t('noSearchResultsDesc')
            : t('noNotificationsDesc')
          }
        </Typography>

        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          {hasSearch ? (
            <>
              <Button
                variant="contained"
                startIcon={<ClearIcon />}
                onClick={onClearSearch}
              >
                {t('clearSearch')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
              >
                {t('refresh')}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              {t('refresh')}
            </Button>
          )}
        </Box>
      </motion.div>

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          opacity: 0.5
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          opacity: 0.3
        }}
      />
    </Paper>
  );
};

export default EmptyState;