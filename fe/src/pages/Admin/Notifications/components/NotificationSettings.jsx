import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Button,
  IconButton,
  Paper,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  VolumeUp as SoundIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  RestoreFromTrash as ResetIcon
} from '@mui/icons-material';

const NotificationSettings = ({ open, onClose }) => {
  const { t } = useTranslation('notifications');
  const theme = useTheme();

  // Settings state
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    soundNotifications: true,
    frequency: 'immediately',
    categories: {
      orderUpdates: true,
      systemAlerts: true,
      promotions: false,
      reminders: true
    }
  });

  const frequencyOptions = [
    { value: 'immediately', label: t('immediately') },
    { value: 'hourly', label: t('hourly') },
    { value: 'daily', label: t('daily') },
    { value: 'weekly', label: t('weekly') },
    { value: 'never', label: t('never') }
  ];

  const categoryOptions = [
    { key: 'orderUpdates', label: t('orderUpdates'), icon: '📦' },
    { key: 'systemAlerts', label: t('systemAlerts'), icon: '⚠️' },
    { key: 'promotions', label: t('promotions'), icon: '🎉' },
    { key: 'reminders', label: t('reminders'), icon: '⏰' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryChange = (category, enabled) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: enabled
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      pushNotifications: true,
      emailNotifications: false,
      soundNotifications: true,
      frequency: 'immediately',
      categories: {
        orderUpdates: true,
        systemAlerts: true,
        promotions: false,
        reminders: true
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 600
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">
              {t('notificationSettings')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          {/* General Settings */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon />
              {t('generalSettings')}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{t('enablePushNotifications')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('pushNotificationsDesc')}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2, alignItems: 'flex-start' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{t('enableEmailNotifications')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('emailNotificationsDesc')}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2, alignItems: 'flex-start' }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundNotifications}
                    onChange={(e) => handleSettingChange('soundNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{t('enableSoundNotifications')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('soundNotificationsDesc')}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </Box>
          </Paper>

          {/* Frequency Settings */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: alpha(theme.palette.secondary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon />
              {t('notificationFrequency')}
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{t('frequency')}</InputLabel>
              <Select
                value={settings.frequency}
                label={t('frequency')}
                onChange={(e) => handleSettingChange('frequency', e.target.value)}
              >
                {frequencyOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('frequencyDesc')}
            </Typography>
          </Paper>

          {/* Category Settings */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: alpha(theme.palette.success.main, 0.02),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon />
              {t('categories')}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('categoriesDesc')}
            </Typography>

            <Box sx={{ mt: 2 }}>
              {categoryOptions.map(category => (
                <Box key={category.key} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.categories[category.key]}
                        onChange={(e) => handleCategoryChange(category.key, e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                        <Typography variant="body1">{category.label}</Typography>
                      </Box>
                    }
                  />
                </Box>
              ))}
            </Box>

            {/* Active Categories Summary */}
            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('activeCategories')}:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {categoryOptions
                  .filter(cat => settings.categories[cat.key])
                  .map(cat => (
                    <Chip
                      key={cat.key}
                      label={cat.label}
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={<span style={{ fontSize: '0.9rem' }}>{cat.icon}</span>}
                    />
                  ))
                }
                {categoryOptions.filter(cat => settings.categories[cat.key]).length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {t('noActiveCategories')}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={handleReset}
        >
          {t('resetToDefault')}
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="outlined"
          onClick={onClose}
        >
          {t('cancel')}
        </Button>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          {t('saveSettings')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettings;