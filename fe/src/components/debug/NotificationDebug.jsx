import React from 'react';
import { Box, Typography, Button, Paper, Alert, Chip } from '@mui/material';
import { useNotifications } from 'context/NotificationContext';
import { useBackendStatus } from 'context/BackendStatusContext';
import { AuthContext } from 'context/AuthContext';
import { useContext } from 'react';

export default function NotificationDebug() {
  const { items, markAsRead, markAll } = useNotifications();
  const { isBackendAvailable, isChecking, lastChecked } = useBackendStatus();
  const { auth } = useContext(AuthContext);

  const addTestNotification = () => {
    // This would normally come from the backend
    const testNotification = {
      id: Date.now(),
      title: "Test Notification",
      message: "This is a test notification created locally",
      type: "info",
      priority: "normal",
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Adding test notification:", testNotification);
    // For testing, we can't directly add to the context, but we can log it
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Notification System Debug
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Backend Status:
        </Typography>
        <Chip 
          label={isBackendAvailable ? "Available" : "Unavailable"} 
          color={isBackendAvailable ? "success" : "error"}
          sx={{ mr: 1 }}
        />
        <Chip 
          label={isChecking ? "Checking..." : "Idle"} 
          color={isChecking ? "warning" : "default"}
          sx={{ mr: 1 }}
        />
        {lastChecked && (
          <Typography variant="caption" color="text.secondary">
            Last checked: {lastChecked.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Auth Status:
        </Typography>
        <Chip 
          label={auth?.token ? "Authenticated" : "Not authenticated"} 
          color={auth?.token ? "success" : "error"}
          sx={{ mr: 1 }}
        />
        {auth?.user && (
          <Typography variant="caption" color="text.secondary">
            User: {auth.user.username} ({auth.user.roles?.join(', ')})
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Notifications ({items.length}):
        </Typography>
        {items.length === 0 ? (
          <Alert severity="info">No notifications found</Alert>
        ) : (
          items.slice(0, 3).map((item) => (
            <Box key={item.id} sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight={item.read ? 'normal' : 'bold'}>
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.type} - {item.createdAt}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={addTestNotification}
        >
          Add Test Notification
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => markAll()}
          disabled={items.length === 0}
        >
          Mark All Read
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Debug info: Check browser console for detailed logs
        </Typography>
      </Box>
    </Paper>
  );
}