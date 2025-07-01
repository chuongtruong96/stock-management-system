import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  GetApp as ExportIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ExportManager = ({ 
  onExport, 
  disabled = false, 
  loading = false,
  dataCount = 0 
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setExportLoading(null);
  };

  const handleExport = async (format) => {
    setExportLoading(format);
    try {
      await onExport(format);
    } finally {
      setExportLoading(null);
      handleClose();
    }
  };

  const exportOptions = [
    {
      id: 'excel',
      label: t('exportExcel') || 'Export to Excel',
      icon: ExcelIcon,
      color: 'success',
      description: t('excelDescription') || 'Download as .xlsx file'
    },
    {
      id: 'pdf',
      label: t('exportPdf') || 'Export to PDF',
      icon: PdfIcon,
      color: 'error',
      description: t('pdfDescription') || 'Download as .pdf file'
    }
  ];

  const advancedOptions = [
    {
      id: 'email',
      label: t('emailReport') || 'Email Report',
      icon: EmailIcon,
      color: 'info',
      description: t('emailDescription') || 'Send report via email',
      disabled: true // Coming soon
    },
    {
      id: 'schedule',
      label: t('scheduleReport') || 'Schedule Report',
      icon: ScheduleIcon,
      color: 'warning',
      description: t('scheduleDescription') || 'Set up recurring reports',
      disabled: true // Coming soon
    }
  ];

  return (
    <>
      <Tooltip title={disabled ? t('noDataToExport') || 'No data to export' : t('exportOptions') || 'Export options'}>
        <span>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ExportIcon />}
            onClick={handleClick}
            disabled={disabled || loading || dataCount === 0}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {t('export') || 'Export'}
          </Button>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 280,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="600">
            {t('exportReport') || 'Export Report'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('exportCount', { count: dataCount }) || `${dataCount} items available`}
          </Typography>
        </Box>

        {exportOptions.map((option) => {
          const IconComponent = option.icon;
          const isLoading = exportLoading === option.id;
          
          return (
            <MenuItem
              key={option.id}
              onClick={() => handleExport(option.id)}
              disabled={isLoading}
              sx={{ py: 1.5, px: 2 }}
            >
              <ListItemIcon>
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconComponent fontSize="small" color={option.color} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={option.label}
                secondary={option.description}
                primaryTypographyProps={{ fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 1 }} />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SettingsIcon fontSize="inherit" />
            {t('advancedOptions') || 'Advanced Options'}
          </Typography>
        </Box>

        {advancedOptions.map((option) => {
          const IconComponent = option.icon;
          
          return (
            <MenuItem
              key={option.id}
              onClick={() => !option.disabled && handleExport(option.id)}
              disabled={option.disabled}
              sx={{ py: 1.5, px: 2 }}
            >
              <ListItemIcon>
                <IconComponent fontSize="small" color={option.disabled ? 'disabled' : option.color} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.label}
                    {option.disabled && (
                      <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        ({t('comingSoon') || 'Coming Soon'})
                      </Typography>
                    )}
                  </Box>
                }
                secondary={option.description}
                primaryTypographyProps={{ fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ExportManager;