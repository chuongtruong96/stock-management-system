// src/components/common/cards/ProgressCard.jsx
import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Reusable progress card component for displaying progress with visual indicators
 */
const ProgressCard = ({
  title,
  subtitle,
  progress = 0,
  status,
  statusColor = 'primary',
  description,
  steps = [],
  currentStep = 0,
  variant = 'default',
  color = 'primary',
  showPercentage = true,
  icon,
  actions,
  sx = {},
}) => {
  const getProgressColor = () => {
    if (progress === 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'primary';
  };

  const progressColor = color === 'auto' ? getProgressColor() : color;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        borderRadius: 3,
        background: variant === 'gradient' 
          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)'
          : 'background.paper',
        border: variant === 'outlined' ? '1px solid' : 'none',
        borderColor: variant === 'outlined' ? `${progressColor}.light` : 'transparent',
        ...sx,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {icon && (
            <Box sx={{ fontSize: '1.5rem' }}>
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h5" fontWeight={600} color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          {status && (
            <Chip
              label={status}
              color={statusColor}
              variant="filled"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          {showPercentage && (
            <Typography variant="h6" fontWeight={600} color={`${progressColor}.main`}>
              {progress}%
            </Typography>
          )}
          {actions}
        </Stack>
      </Stack>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progressColor}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              transition: 'transform 0.6s ease-in-out',
            },
          }}
        />
      </Box>

      {/* Description */}
      {description && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
            Progress Steps:
          </Typography>
          <Stack spacing={2}>
            {steps.map((step, index) => (
              <Stack key={index} direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: index <= currentStep ? `${progressColor}.main` : 'grey.300',
                    color: index <= currentStep ? 'white' : 'grey.600',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={index === currentStep ? 600 : 400}
                    color={index <= currentStep ? 'text.primary' : 'text.secondary'}
                  >
                    {step.title}
                  </Typography>
                  {step.description && (
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  )}
                </Box>
                {index <= currentStep && (
                  <Box sx={{ color: `${progressColor}.main` }}>
                    ✓
                  </Box>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

ProgressCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  progress: PropTypes.number,
  status: PropTypes.string,
  statusColor: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  description: PropTypes.string,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  currentStep: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'gradient', 'outlined']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info', 'auto']),
  showPercentage: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  actions: PropTypes.node,
  sx: PropTypes.object,
};

export default ProgressCard;