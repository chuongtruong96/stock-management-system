// Enhanced Collapsible Pending Order Widget
import React, { useState, useEffect } from 'react';
import '../../css/components/collapsible-pending-order.css';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Collapse,
  Chip,
  Badge,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import PendingOrderWidget from './PendingOrderWidget';

// Keyframes for animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 152, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.8), 0 0 30px rgba(255, 152, 0, 0.6);
  }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

const CollapsiblePendingOrderWidget = ({ 
  order, 
  onRefresh, 
  defaultCollapsed = true 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHidden, setIsHidden] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [isNewOrder, setIsNewOrder] = useState(false);

  // Check if this is a new order
  useEffect(() => {
    if (order && order.id !== lastOrderId) {
      setIsNewOrder(true);
      setLastOrderId(order.id);
      // Reset new order flag after 10 seconds
      const timer = setTimeout(() => setIsNewOrder(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [order, lastOrderId]);

  // Get order status info
  const getOrderStatusInfo = () => {
    if (!order) return { icon: <ScheduleIcon />, color: 'default', severity: 'info' };

    const status = order.status?.toLowerCase();
    switch (status) {
      case 'pending':
        return { 
          icon: <ScheduleIcon />, 
          color: 'warning', 
          severity: 'warning',
          message: 'Pending approval'
        };
      case 'approved':
        return { 
          icon: <CheckCircleIcon />, 
          color: 'success', 
          severity: 'success',
          message: 'Approved - Ready for processing'
        };
      case 'rejected':
        return { 
          icon: <ErrorIcon />, 
          color: 'error', 
          severity: 'error',
          message: 'Requires attention'
        };
      case 'processing':
        return { 
          icon: <ScheduleIcon />, 
          color: 'info', 
          severity: 'info',
          message: 'Being processed'
        };
      default:
        return { 
          icon: <WarningIcon />, 
          color: 'warning', 
          severity: 'warning',
          message: 'Needs action'
        };
    }
  };

  const statusInfo = getOrderStatusInfo();

  // Calculate urgency level
  const getUrgencyLevel = () => {
    if (!order) return 'low';
    
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
    
    if (hoursSinceCreated > 48) return 'high';
    if (hoursSinceCreated > 24) return 'medium';
    return 'low';
  };

  const urgencyLevel = getUrgencyLevel();

  // Get animation styles based on urgency and status
  const getAnimationStyles = () => {
    if (isHidden) return {};
    
    const baseStyles = {
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };

    if (isNewOrder) {
      return {
        ...baseStyles,
        animation: `${pulseAnimation} 2s infinite`,
      };
    }

    if (urgencyLevel === 'high') {
      return {
        ...baseStyles,
        animation: `${shakeAnimation} 0.5s ease-in-out infinite`,
      };
    }

    if (urgencyLevel === 'medium' || statusInfo.severity === 'warning') {
      return {
        ...baseStyles,
        animation: `${glowAnimation} 3s ease-in-out infinite`,
      };
    }

    return baseStyles;
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleHideWidget = () => {
    setIsHidden(true);
    // Store in localStorage to remember user preference
    localStorage.setItem('pendingOrderWidgetHidden', 'true');
  };

  const handleShowWidget = () => {
    setIsHidden(false);
    localStorage.removeItem('pendingOrderWidgetHidden');
  };

  // Check if widget should be hidden on mount
  useEffect(() => {
    const isHiddenStored = localStorage.getItem('pendingOrderWidgetHidden') === 'true';
    setIsHidden(isHiddenStored);
  }, []);

  if (!order) return null;

  // Hidden state - show minimal notification
  if (isHidden) {
    return (
      <Fade in={true} timeout={500}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Tooltip title="You have a pending order. Click to show details.">
            <Paper
              elevation={8}
              onClick={handleShowWidget}
              sx={{
                p: 1.5,
                borderRadius: 3,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 200,
                ...getAnimationStyles(),
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 30px rgba(255, 152, 0, 0.4)',
                }
              }}
            >
              <Badge
                badgeContent={isNewOrder ? 'NEW' : '!'}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    minWidth: isNewOrder ? 'auto' : 16,
                    height: 16,
                    padding: isNewOrder ? '0 4px' : 0,
                  }
                }}
              >
                <NotificationsIcon />
              </Badge>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Pending Order
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {statusInfo.message}
                </Typography>
              </Box>
              <VisibilityIcon fontSize="small" />
            </Paper>
          </Tooltip>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Paper
        elevation={isCollapsed ? 4 : 8}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${
            statusInfo.severity === 'error' ? '#f44336' :
            statusInfo.severity === 'warning' ? '#ff9800' :
            statusInfo.severity === 'success' ? '#4caf50' : '#2196f3'
          }`,
          ...getAnimationStyles(),
        }}
      >
        {/* Collapsed Header */}
        <Box
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${
              statusInfo.severity === 'error' ? 'rgba(244, 67, 54, 0.1)' :
              statusInfo.severity === 'warning' ? 'rgba(255, 152, 0, 0.1)' :
              statusInfo.severity === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)'
            } 0%, rgba(255,255,255,0.05) 100%)`,
            borderBottom: isCollapsed ? 'none' : '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `linear-gradient(135deg, ${
                statusInfo.severity === 'error' ? 'rgba(244, 67, 54, 0.15)' :
                statusInfo.severity === 'warning' ? 'rgba(255, 152, 0, 0.15)' :
                statusInfo.severity === 'success' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(33, 150, 243, 0.15)'
              } 0%, rgba(255,255,255,0.1) 100%)`,
            }
          }}
          onClick={handleToggleCollapse}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Status Icon with Badge */}
              <Badge
                badgeContent={isNewOrder ? 'NEW' : (urgencyLevel === 'high' ? '!' : '')}
                color={isNewOrder ? 'secondary' : 'error'}
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    minWidth: isNewOrder ? 'auto' : 16,
                    height: 16,
                    padding: isNewOrder ? '0 4px' : 0,
                  }
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    backgroundColor: `${statusInfo.color}.50`,
                    color: `${statusInfo.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {statusInfo.icon}
                </Box>
              </Badge>

              {/* Order Info */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" fontWeight="600">
                    Pending Order #{order.id}
                  </Typography>
                  <Chip
                    label={order.status}
                    color={statusInfo.color}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      height: 20,
                      fontSize: '0.7rem'
                    }}
                  />
                  {urgencyLevel === 'high' && (
                    <Chip
                      label="URGENT"
                      color="error"
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        height: 20,
                        fontSize: '0.7rem',
                        animation: `${pulseAnimation} 2s infinite`
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {statusInfo.message} • {order.items?.length || 0} items • Total: ${order.total?.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Hide this widget">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHideWidget();
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                >
                  <VisibilityOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <IconButton
                size="small"
                sx={{
                  color: 'text.secondary',
                  transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Collapsible Content */}
        <Collapse in={!isCollapsed} timeout={400}>
          <Box sx={{ p: 0 }}>
            <PendingOrderWidget
              order={order}
              onRefresh={onRefresh}
              embedded={true}
            />
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  );
};

export default CollapsiblePendingOrderWidget;