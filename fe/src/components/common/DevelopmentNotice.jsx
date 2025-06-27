// src/components/common/DevelopmentNotice.jsx
import React from 'react';
import { Alert, AlertTitle, Box, Collapse, IconButton, Button } from '@mui/material';
import { Close as CloseIcon, Warning as WarningIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useBackendStatus } from '../../context/BackendStatusContext';

export default function DevelopmentNotice() {
  const { isBackendAvailable, isChecking, recheckBackend, lastChecked } = useBackendStatus();
  const [dismissed, setDismissed] = React.useState(false);

  // Only show in development and when backend is not available
  const shouldShow = process.env.NODE_ENV === 'development' && 
                    !isBackendAvailable && 
                    !isChecking && 
                    !dismissed;

  if (!shouldShow) return null;

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <Collapse in={!dismissed}>
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={recheckBackend}
                disabled={isChecking}
                sx={{ color: 'inherit' }}
              >
                {isChecking ? 'Checking...' : 'Recheck'}
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setDismissed(true)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          }
          sx={{ 
            borderRadius: 0,
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          <AlertTitle>Backend Server Not Running</AlertTitle>
          The backend server (localhost:8080) is not available. WebSocket connections and some API calls are disabled. 
          Please start the backend server to enable full functionality.
          {lastChecked && (
            <Box sx={{ mt: 1, fontSize: '0.8rem', opacity: 0.8 }}>
              Last checked: {lastChecked.toLocaleTimeString()}
            </Box>
          )}
        </Alert>
      </Collapse>
    </Box>
  );
}