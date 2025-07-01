import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, error, info, success
  severity = "medium", // low, medium, high
  loading = false,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: ErrorIcon,
          color: theme.palette.error.main,
          bgColor: theme.palette.error.light + '20',
          confirmColor: 'error'
        };
      case 'info':
        return {
          icon: InfoIcon,
          color: theme.palette.info.main,
          bgColor: theme.palette.info.light + '20',
          confirmColor: 'info'
        };
      case 'success':
        return {
          icon: SuccessIcon,
          color: theme.palette.success.main,
          bgColor: theme.palette.success.light + '20',
          confirmColor: 'success'
        };
      default: // warning
        return {
          icon: WarningIcon,
          color: theme.palette.warning.main,
          bgColor: theme.palette.warning.light + '20',
          confirmColor: 'warning'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          iconSize: 64,
          titleVariant: 'h5',
          messageVariant: 'body1',
          confirmVariant: 'contained'
        };
      case 'low':
        return {
          iconSize: 40,
          titleVariant: 'h6',
          messageVariant: 'body2',
          confirmVariant: 'outlined'
        };
      default: // medium
        return {
          iconSize: 52,
          titleVariant: 'h6',
          messageVariant: 'body1',
          confirmVariant: 'contained'
        };
    }
  };

  const severityStyles = getSeverityStyles();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          boxShadow: theme.shadows[10],
          overflow: 'visible'
        }
      }}
      {...props}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
          zIndex: 1,
          '&:hover': {
            backgroundColor: theme.palette.grey[100]
          }
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Header with icon */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${typeConfig.bgColor} 0%, ${typeConfig.color}15 100%)`,
          pt: 4,
          pb: 2,
          px: 3,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: severityStyles.iconSize + 16,
            height: severityStyles.iconSize + 16,
            borderRadius: '50%',
            backgroundColor: typeConfig.color + '20',
            border: `3px solid ${typeConfig.color}40`,
            mb: 2
          }}
        >
          <IconComponent
            sx={{
              fontSize: severityStyles.iconSize,
              color: typeConfig.color
            }}
          />
        </Box>

        <DialogTitle
          sx={{
            p: 0,
            fontSize: severityStyles.titleVariant === 'h5' ? '1.5rem' : '1.25rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2
          }}
        >
          {title}
        </DialogTitle>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography
          variant={severityStyles.messageVariant}
          color="text.secondary"
          sx={{
            textAlign: 'center',
            lineHeight: 1.6,
            fontSize: severityStyles.messageVariant === 'body1' ? '1rem' : '0.875rem'
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1,
          justifyContent: 'center'
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant={severityStyles.confirmVariant}
          color={typeConfig.confirmColor}
          size="large"
          sx={{
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: severity === 'high' ? theme.shadows[4] : theme.shadows[2],
            '&:hover': {
              boxShadow: severity === 'high' ? theme.shadows[6] : theme.shadows[4]
            }
          }}
          disabled={loading}
          startIcon={loading ? null : type === 'error' ? <DeleteIcon /> : null}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;