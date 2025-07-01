import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  IconButton,
  Typography,
  Slide,
  Grow,
  Fade,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const iconMap = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  cart: CartIcon,
  favorite: FavoriteIcon,
  share: ShareIcon,
  filter: FilterIcon,
};

const colorMap = {
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  cart: '#2196f3',
  favorite: '#e91e63',
  share: '#9c27b0',
  filter: '#607d8b',
};

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function GrowTransition(props) {
  return <Grow {...props} />;
}

export default function EnhancedToast({
  open,
  onClose,
  message,
  title,
  type = 'info',
  duration = 4000,
  position = { vertical: 'bottom', horizontal: 'right' },
  showProgress = true,
  action,
  icon: customIcon,
  transition = 'slide',
  persistent = false,
  details,
  chips = [],
}) {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = customIcon || iconMap[type] || InfoIcon;
  const color = colorMap[type] || colorMap.info;

  const TransitionComponent = transition === 'grow' ? GrowTransition : SlideTransition;

  useEffect(() => {
    if (!open || persistent || isHovered) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onClose?.();
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [open, duration, onClose, persistent, isHovered]);

  useEffect(() => {
    if (open) {
      setProgress(100);
    }
  }, [open]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={TransitionComponent}
      sx={{
        '& .MuiSnackbar-root': {
          position: 'fixed',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={type === 'cart' || type === 'favorite' || type === 'share' || type === 'filter' ? 'info' : type}
        variant="filled"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          minWidth: 320,
          maxWidth: 480,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${color}20`,
          background: `linear-gradient(135deg, ${color}f0 0%, ${color}e0 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '& .MuiAlert-icon': {
            color: 'white',
            fontSize: '1.5rem',
          },
          '& .MuiAlert-action': {
            color: 'white',
            '& .MuiIconButton-root': {
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            },
          },
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.2s ease-in-out',
        }}
        icon={<IconComponent />}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {action}
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        <Box>
          {title && (
            <AlertTitle sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
              {title}
            </AlertTitle>
          )}
          
          <Typography variant="body2" sx={{ color: 'white', mb: details || chips.length > 0 ? 1 : 0 }}>
            {message}
          </Typography>

          {details && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 1 }}>
              {details}
            </Typography>
          )}

          {chips.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {chips.map((chip, index) => (
                <Chip
                  key={index}
                  label={chip.label}
                  size="small"
                  onClick={chip.onClick}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Progress Bar */}
        {showProgress && !persistent && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: 'rgba(255,255,255,0.8)',
                transition: 'width 0.1s linear',
                borderRadius: '0 2px 2px 0',
              }}
            />
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
}

// Hook for using enhanced toasts
export function useEnhancedToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (options) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...options };
    
    setToasts(prev => [...prev, toast]);

    // Auto remove after duration
    if (!options.persistent) {
      setTimeout(() => {
        removeToast(id);
      }, options.duration || 4000);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, options = {}) => 
    showToast({ ...options, message, type: 'success' });

  const showError = (message, options = {}) => 
    showToast({ ...options, message, type: 'error' });

  const showWarning = (message, options = {}) => 
    showToast({ ...options, message, type: 'warning' });

  const showInfo = (message, options = {}) => 
    showToast({ ...options, message, type: 'info' });

  const showCart = (message, options = {}) => 
    showToast({ ...options, message, type: 'cart' });

  const showFavorite = (message, options = {}) => 
    showToast({ ...options, message, type: 'favorite' });

  const showShare = (message, options = {}) => 
    showToast({ ...options, message, type: 'share' });

  const showFilter = (message, options = {}) => 
    showToast({ ...options, message, type: 'filter' });

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <EnhancedToast
          key={toast.id}
          open={true}
          onClose={() => removeToast(toast.id)}
          {...toast}
        />
      ))}
    </>
  );

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCart,
    showFavorite,
    showShare,
    showFilter,
    removeToast,
    ToastContainer,
  };
}