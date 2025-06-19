// src/components/common/layout/PageHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Reusable page header component with gradient background and flexible content
 */
const PageHeader = ({
  title,
  subtitle,
  icon,
  status,
  statusColor = 'primary',
  breadcrumbs = [],
  actions,
  infoCards = [],
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  children,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0,
        }}
      />
      
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
          sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              color="inherit"
              href={crumb.href}
              onClick={crumb.onClick}
              sx={{
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                cursor: crumb.href || crumb.onClick ? 'pointer' : 'default',
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      {/* Header content */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, zIndex: 1, position: 'relative' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {icon && (
            <Box sx={{ fontSize: '2rem' }}>
              {typeof icon === 'string' ? icon : icon}
            </Box>
          )}
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
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
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                backdropFilter: 'blur(10px)',
              }}
            />
          )}
          {actions}
        </Stack>
      </Stack>

      {/* Info cards */}
      {infoCards.length > 0 && (
        <Grid container spacing={3} sx={{ zIndex: 1, position: 'relative' }}>
          {infoCards.map((card, index) => (
            <Grid item xs={12} md={12 / infoCards.length} key={index}>
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  p: 3,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  {card.icon && (
                    <Box sx={{ fontSize: '1.5rem' }}>
                      {card.icon}
                    </Box>
                  )}
                  <Typography variant="h6" fontWeight={600}>
                    {card.title}
                  </Typography>
                </Stack>
                <Typography variant="body1" fontWeight={500}>
                  {card.value || 'Loading...'}
                </Typography>
                {card.subtitle && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {card.subtitle}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Custom children content */}
      {children && (
        <Box sx={{ mt: infoCards.length > 0 ? 3 : 0, zIndex: 1, position: 'relative' }}>
          {children}
        </Box>
      )}
    </Paper>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  status: PropTypes.string,
  statusColor: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  actions: PropTypes.node,
  infoCards: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      subtitle: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    })
  ),
  gradient: PropTypes.string,
  children: PropTypes.node,
};

export default PageHeader;