// src/components/common/buttons/ActionButton.jsx
import React from 'react';
import {
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Enhanced action button with loading states, icons, and step-based styling
 */
const ActionButton = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  size = 'large',
  startIcon,
  endIcon,
  fullWidth = false,
  step,
  stepTitle,
  stepDescription,
  stepColor,
  sx = {},
  ...props
}) => {
  const isStepButton = Boolean(step);
  
  const getStepStyling = () => {
    if (!isStepButton) return {};
    
    return {
      p: 3,
      borderRadius: 2,
      textAlign: 'center',
      background: stepColor ? `${stepColor}.light` : `${color}.light`,
      color: 'white',
      flexDirection: 'column',
      minHeight: 120,
      '&:hover': {
        background: stepColor ? `${stepColor}.main` : `${color}.main`,
        transform: 'translateY(-2px)',
        boxShadow: 4,
      },
      '&:disabled': {
        background: 'rgba(0,0,0,0.12)',
        color: 'rgba(0,0,0,0.26)',
      },
      transition: 'all 0.3s ease',
    };
  };

  const buttonContent = isStepButton ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      {step && (
        <Typography variant="h6" fontWeight={600} color="inherit">
          {step}
        </Typography>
      )}
      {stepTitle && (
        <Typography variant="h6" fontWeight={600} color="inherit">
          {stepTitle}
        </Typography>
      )}
      {stepDescription && (
        <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mt: 1 }}>
          {stepDescription}
        </Typography>
      )}
      {children && !stepTitle && children}
    </Box>
  ) : (
    children
  );

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      fullWidth={fullWidth}
      sx={{
        py: isStepButton ? 0 : size === 'large' ? 1.5 : 1,
        px: isStepButton ? 0 : size === 'large' ? 4 : 2,
        fontSize: size === 'large' ? '1.1rem' : '1rem',
        fontWeight: 600,
        position: 'relative',
        ...getStepStyling(),
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-10px',
            marginTop: '-10px',
            color: 'inherit',
          }}
        />
      )}
      <Box sx={{ opacity: loading ? 0 : 1, transition: 'opacity 0.2s' }}>
        {buttonContent}
      </Box>
    </Button>
  );
};

ActionButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  step: PropTypes.string,
  stepTitle: PropTypes.string,
  stepDescription: PropTypes.string,
  stepColor: PropTypes.string,
  sx: PropTypes.object,
};

export default ActionButton;