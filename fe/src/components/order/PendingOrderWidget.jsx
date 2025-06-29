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

const ORDER_STATUS_CONFIG = {
  pending: {
    label: "PDF Export Required",
    color: "warning",
    progress: 25,
    icon: <DownloadIcon />,
    description: "Your order is ready. Export PDF for signature.",
    actionText: "Export PDF",
    urgency: "medium"
  },
  exported: {
    label: "Upload Signed PDF",
    color: "info", 
    progress: 50,
    icon: <UploadIcon />,
    description: "PDF exported. Please get it signed and upload back.",
    actionText: "Upload Signed PDF",
    urgency: "high"
  },
  uploaded: {
    label: "Submit to Admin",
    color: "secondary",
    progress: 75,
    icon: <SendIcon />,
    description: "Signed PDF uploaded. Ready to submit for approval.",
    actionText: "Submit Order",
    urgency: "high"
  },
  submitted: {
    label: "Awaiting Approval",
    color: "primary",
    progress: 90,
    icon: <ScheduleIcon />,
    description: "Order submitted. Waiting for admin approval.",
    actionText: "View Details",
    urgency: "low"
  }
};

const PendingOrderWidget = ({ order, onRefresh }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!order) return null;

  const config = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "default",
    progress: 0,
    icon: <AssignmentIcon />,
    description: "Order status unknown",
    actionText: "View Order",
    urgency: "low"
  };

  const handleContinueOrder = () => {
    navigate('/order-form');
  };

  const handleViewDetails = () => {
    navigate(`/orders/${order.orderId || order.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Date";
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
          🔥 Action Required
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
                📋 Pending Order
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order #{order.orderId || order.id} • {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Stack>
          
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            Refresh
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
              {config.progress}% Complete
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
            Order Summary:
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              Items: {order.itemCount || 'N/A'}
            </Typography>
            <Typography variant="body2">
              Department: {order.departmentName || 'N/A'}
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
            Details
          </Button>
        </Stack>

        {/* Quick Tips */}
        {config.urgency === 'high' && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              💡 <strong>Quick Tip:</strong> {
                order.status === 'exported' 
                  ? 'After getting your PDF signed, you can upload it directly from the Order Form or Order Details page.'
                  : order.status === 'uploaded'
                    ? 'Your signed PDF is ready. Submit it to admin for final approval.'
                    : 'Continue your order process to avoid delays.'
              }
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingOrderWidget;