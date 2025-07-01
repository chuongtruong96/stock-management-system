import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveContainer = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        '& .MuiCard-root': {
          borderRadius: isMobile ? 2 : 3,
          boxShadow: isMobile 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : '0 4px 20px rgba(0,0,0,0.08)',
        },
        '& .MuiGrid-container': {
          spacing: isMobile ? 2 : 3,
        },
        '& .MuiButton-root': {
          fontSize: isMobile ? '0.875rem' : '1rem',
          padding: isMobile ? '8px 16px' : '12px 24px',
        },
        '& .MuiTypography-h4': {
          fontSize: isMobile ? '1.5rem' : '2rem',
        },
        '& .MuiTypography-h5': {
          fontSize: isMobile ? '1.25rem' : '1.5rem',
        },
        '& .MuiTypography-h6': {
          fontSize: isMobile ? '1.1rem' : '1.25rem',
        },
        // DataGrid responsive adjustments
        '& .MuiDataGrid-root': {
          '& .MuiDataGrid-columnHeaders': {
            minHeight: isMobile ? '48px !important' : '64px !important',
          },
          '& .MuiDataGrid-row': {
            minHeight: isMobile ? '56px !important' : '70px !important',
          },
          '& .MuiDataGrid-cell': {
            padding: isMobile ? '8px 12px' : '12px 16px',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: isMobile ? '12px' : '16px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
          },
        },
        // Summary cards responsive
        '& .summary-card': {
          '& .MuiCardContent-root': {
            padding: isMobile ? '16px !important' : '24px !important',
          },
          '& .MuiAvatar-root': {
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
          },
          '& .MuiTypography-h4': {
            fontSize: isMobile ? '1.25rem' : '2rem',
          },
        },
        // Controls panel responsive
        '& .controls-panel': {
          '& .MuiGrid-item': {
            '& .MuiFormControl-root, & .MuiTextField-root': {
              '& .MuiInputBase-root': {
                fontSize: isMobile ? '0.875rem' : '1rem',
              },
            },
          },
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveContainer;