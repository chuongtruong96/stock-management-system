import React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip
} from '@mui/material';
import {
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DatePresets = ({ onPresetSelect, currentMonth, currentYear }) => {
  const { t } = useTranslation();
  const now = new Date();
  
  const presets = [
    {
      id: 'current',
      label: t('currentMonth') || 'Current Month',
      icon: TodayIcon,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      color: 'primary'
    },
    {
      id: 'previous',
      label: t('previousMonth') || 'Previous Month',
      icon: DateRangeIcon,
      month: now.getMonth() === 0 ? 12 : now.getMonth(),
      year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
      color: 'secondary'
    },
    {
      id: 'quarter',
      label: t('currentQuarter') || 'Current Quarter',
      icon: CalendarIcon,
      month: Math.floor((now.getMonth()) / 3) * 3 + 1,
      year: now.getFullYear(),
      color: 'info'
    },
    {
      id: 'year',
      label: t('currentYear') || 'Current Year',
      icon: TimelineIcon,
      month: 1,
      year: now.getFullYear(),
      color: 'success'
    }
  ];

  const isActive = (preset) => {
    return preset.month === currentMonth && preset.year === currentYear;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        {t('quickSelect') || 'Quick Select'}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {presets.map((preset) => {
          const IconComponent = preset.icon;
          const active = isActive(preset);
          
          return (
            <Button
              key={preset.id}
              variant={active ? "contained" : "outlined"}
              size="small"
              color={preset.color}
              startIcon={<IconComponent />}
              onClick={() => onPresetSelect(preset.month, preset.year)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: active ? 600 : 500,
                minWidth: 140, // Fixed minimum width to prevent size changes
                height: 36, // Fixed height for consistency
                px: 2,
                py: 1,
                color: active ? 'white' : '#000000', // Black text for inactive, white for active
                borderColor: active ? undefined : '#000000', // Black border for outlined buttons
                '&:hover': {
                  color: active ? 'white' : '#000000',
                  borderColor: active ? undefined : '#333333',
                },
                // Reserve space for the active indicator without changing button size
                position: 'relative',
                '&::after': active ? {
                  content: '"✓"',
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  color: 'white',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                } : {}
              }}
            >
              {preset.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};

export default DatePresets;