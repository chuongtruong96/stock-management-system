import React from 'react';
import { Container, Typography, Box, Alert, Button, Paper } from '@mui/material';
import { useNotifications } from 'context/NotificationContext';
import { useBackendStatus } from 'context/BackendStatusContext';
import { AuthContext } from 'context/AuthContext';
import { useContext } from 'react';

export default function NotificationTest() {
  const { items, markAsRead, markAll } = useNotifications();
  const { isBackendAvailable, isChecking } = useBackendStatus();
  const { auth } = useContext(AuthContext);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notification System Test
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Alert severity={isBackendAvailable ? "success" : "error"}>
            Backend: {isBackendAvailable ? "Available" : "Unavailable"}
            {isChecking && " (Checking...)"}
          </Alert>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Alert severity={auth?.token ? "success" : "error"}>
            Authentication: {auth?.token ? "Logged in" : "Not logged in"}
            {auth?.user && ` as ${auth.user.username}`}
          </Alert>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications ({items.length})
        </Typography>
        
        {items.length === 0 ? (
          <Alert severity="info">
            No notifications found. This could mean:
            <ul>
              <li>Backend is not available</li>
              <li>No notifications exist for this user</li>
              <li>API endpoint is not working</li>
              <li>WebSocket connection failed</li>
            </ul>
          </Alert>
        ) : (
          <Box>
            {items.slice(0, 5).map((notification) => (
              <Box 
                key={notification.id} 
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  border: '1px solid #ddd', 
                  borderRadius: 1,
                  backgroundColor: notification.read ? '#f5f5f5' : '#fff'
                }}
              >
                <Typography variant="subtitle2" fontWeight={notification.read ? 'normal' : 'bold'}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Type: {notification.type} | Created: {new Date(notification.createdAt).toLocaleString()}
                </Typography>
                {!notification.read && (
                  <Button 
                    size="small" 
                    onClick={() => markAsRead(notification.id)}
                    sx={{ mt: 1 }}
                  >
                    Mark as Read
                  </Button>
                )}
              </Box>
            ))}
            
            {items.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                ... and {items.length - 5} more notifications
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={markAll}
            disabled={items.length === 0}
          >
            Mark All Read
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Troubleshooting
        </Typography>
        
        <Typography variant="body2" paragraph>
          If notifications are not working:
        </Typography>
        
        <ol>
          <li>Check if the backend is running and accessible</li>
          <li>Verify you are logged in with a valid token</li>
          <li>Check browser console for error messages</li>
          <li>Verify the notification API endpoints are working</li>
          <li>Check if WebSocket connection is established</li>
        </ol>

        <Typography variant="body2" color="text.secondary">
          Check the browser console for detailed logs starting with [NOTIFY] or [NOTIFY-WS]
        </Typography>
      </Paper>
    </Container>
  );
}