import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  Button,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrderHistoryItem({ order }) {
  const navigate = useNavigate();
  const { t } = useTranslation('orders');

  if (!order) return null;

  const handleClick = () => {
    navigate(`/orders/${order.orderId || order.id}`);
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          color: "info",
          icon: <HourglassEmptyIcon />,
          label: t('status.orderCreated'),
          description: t('historyItem.waitingForPdfExport')
        };
      case "exported":
        return {
          color: "warning",
          icon: <PictureAsPdfIcon />,
          label: t('status.pdfExported'),
          description: t('historyItem.readyForSignature')
        };
      case "uploaded":
        return {
          color: "secondary",
          icon: <CloudUploadIcon />,
          label: t('status.signedPdfUploaded'),
          description: t('historyItem.readyToSubmit')
        };
      case "submitted":
        return {
          color: "primary",
          icon: <SendIcon />,
          label: t('status.submittedForApproval'),
          description: t('historyItem.underAdminReview')
        };
      case "approved":
        return {
          color: "success",
          icon: <CheckCircleIcon />,
          label: t('status.approved'),
          description: t('historyItem.orderWillBeProcessed')
        };
      case "rejected":
        return {
          color: "error",
          icon: <CancelIcon />,
          label: t('status.rejected'),
          description: t('historyItem.orderWasDeclined')
        };
      default:
        return {
          color: "default",
          icon: <AssignmentIcon />,
          label: status || t('status.unknownStatus'),
          description: t('historyItem.statusUnknown')
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('common.invalidDate');
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return t('historyItem.justNow');
      if (diffInHours < 24) return t('historyItem.hoursAgo', { hours: diffInHours });
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return t('historyItem.daysAgo', { days: diffInDays });
      return formatDate(dateString);
    } catch {
      return "";
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={handleClick}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: `${statusConfig.color}.main`,
                color: 'white',
              }}
            >
              {statusConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                {t('historyItem.orderNumber', { number: order.orderId || order.id })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.orderNumber || `ORD-${order.orderId || order.id}`}
              </Typography>
            </Box>
          </Stack>
          
          <Stack alignItems="flex-end" spacing={1}>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              color={statusConfig.color}
              variant="filled"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {getTimeAgo(order.updatedAt || order.createdAt)}
            </Typography>
          </Stack>
        </Stack>

        {/* Status Description */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {statusConfig.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Order Details */}
        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('historyItem.created')}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <AssignmentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('historyItem.items')}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {t('historyItem.itemCount', { count: order.itemCount || 0 })}
              </Typography>
            </Box>
          </Stack>

          {order.departmentName && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('historyItem.department')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {order.departmentName}
                </Typography>
              </Box>
            </Stack>
          )}

          {order.createdBy && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t('historyItem.createdBy')}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {order.createdBy}
                </Typography>
              </Box>
            </Stack>
          )}
        </Stack>

        {/* Admin Comment */}
        {order.adminComment && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t('historyItem.adminComment')}:
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ 
              bgcolor: 'grey.50', 
              p: 1, 
              borderRadius: 1,
              fontStyle: 'italic'
            }}>
              "{order.adminComment}"
            </Typography>
          </Box>
        )}

        {/* Action Button */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {t('actions.viewDetails')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}