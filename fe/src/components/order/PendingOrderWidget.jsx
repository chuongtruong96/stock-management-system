import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


const PendingOrderWidget = ({ order, onRefresh }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('orders');

  if (!order) return null;

  const getOrderStatusConfig = (status) => {
    const configs = {
      pending: {
        label: t('status.pdfExportRequired'),
        color: "warning",
        progress: 25,
        icon: <DownloadIcon />,
        description: t('status.pdfExportDescription'),
        actionText: t('actions.exportPdf'),
        urgency: "medium"
      },
      exported: {
        label: t('status.uploadSignedPdf'),
        color: "info", 
        progress: 50,
        icon: <UploadIcon />,
        description: t('status.uploadSignedDescription'),
        actionText: t('actions.uploadSignedPdf'),
        urgency: "high"
      },
      uploaded: {
        label: t('status.submitToAdmin'),
        color: "secondary",
        progress: 75,
        icon: <SendIcon />,
        description: t('status.submitToAdminDescription'),
        actionText: t('actions.submitOrder'),
        urgency: "high"
      },
      submitted: {
        label: t('status.awaitingApproval'),
        color: "primary",
        progress: 90,
        icon: <ScheduleIcon />,
        description: t('status.awaitingApprovalDescription'),
        actionText: t('actions.viewDetails'),
        urgency: "low"
      }
    };

    return configs[status] || {
      label: status,
      color: "default",
      progress: 0,
      icon: <AssignmentIcon />,
      description: t('status.unknownStatus'),
      actionText: t('actions.viewOrder'),
      urgency: "low"
    };
  };

  const config = getOrderStatusConfig(order.status);

  const handleContinueOrder = () => {
    navigate('/order-form');
  };

  const handleViewDetails = () => {
    navigate(`/orders/${order.orderId || order.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('common.invalidDate');
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#ff5722';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        border: '2px solid',
        borderColor: config.urgency === 'high' ? 'warning.main' : 'primary.light',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
        },
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {/* Urgency Indicator */}
      {config.urgency === 'high' && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: 16,
            bgcolor: 'warning.main',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 1,
          }}
        >
          🔥 {t('common.actionRequired')}
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: `${config.color}.main`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {config.icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                📋 {t('title.pendingOrder')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('labels.orderNumber')} #{order.orderId || order.id} • {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Stack>
          
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            {t('actions.refresh')}
          </Button>
        </Stack>

        {/* Status */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Chip
              icon={config.icon}
              label={config.label}
              color={config.color}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {config.progress}% {t('labels.complete')}
            </Typography>
          </Stack>
          
          <LinearProgress
            variant="determinate"
            value={config.progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${getUrgencyColor(config.urgency)} 0%, ${getUrgencyColor(config.urgency)}CC 100%)`,
              },
            }}
          />
        </Box>

        {/* Description */}
        <Alert 
          severity={config.urgency === 'high' ? 'warning' : 'info'} 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {config.description}
          </Typography>
        </Alert>

        {/* Order Summary */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('labels.orderSummary')}:
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              {t('labels.items')}: {order.itemCount || t('common.notAvailable')}
            </Typography>
            <Typography variant="body2">
              {t('labels.department')}: {order.departmentName || t('common.notAvailable')}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={config.icon}
            onClick={handleContinueOrder}
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: 600,
              background: config.urgency === 'high' 
                ? 'linear-gradient(135deg, #ff5722 0%, #f44336 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: config.urgency === 'high'
                  ? 'linear-gradient(135deg, #e64a19 0%, #d32f2f 100%)'
                  : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {config.actionText}
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowForwardIcon />}
            onClick={handleViewDetails}
            sx={{
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { 
                borderWidth: 2,
                transform: 'translateY(-2px)',
              },
            }}
          >
            {t('actions.details')}
          </Button>
        </Stack>

        {/* Quick Tips */}
        {config.urgency === 'high' && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              💡 <strong>{t('labels.quickTip')}:</strong> {
                order.status === 'exported' 
                  ? t('tips.afterSigningPdf')
                  : order.status === 'uploaded'
                    ? t('tips.signedPdfReady')
                    : t('tips.continueProcess')
              }
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOrderWidget;