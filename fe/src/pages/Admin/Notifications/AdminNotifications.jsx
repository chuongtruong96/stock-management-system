import React from "react";
import { Container, Typography, Box, Alert, Button, Paper, Card, CardContent } from "@mui/material";
import { useNotifications } from "context/NotificationContext";
import { useBackendStatus } from "context/BackendStatusContext";
import { AuthContext } from "context/AuthContext";
import { useContext } from "react";
import AdminLayout from "layouts/AdminLayout";

export default function AdminNotifications() {
  const { items, markAsRead, markAll } = useNotifications();
  const { isBackendAvailable, isChecking } = useBackendStatus();
  const { auth } = useContext(AuthContext);

  return (
    <AdminLayout titleKey="notifications" icon="notifications">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Notifications
        </Typography>

        {/* Debug Info */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
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
              {auth?.user && ` as ${auth.user.username} (${auth.user.roles?.join(', ')})`}
            </Alert>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Alert severity={items.length > 0 ? "success" : "info"}>
              Notifications: {items.length} total, {items.filter(n => !n.read).length} unread
            </Alert>
          </Box>
        </Paper>

        {/* Notifications List */}
        <Paper sx={{ p: 3 }}>
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
              {items.map((notification) => (
                <Card 
                  key={notification.id} 
                  sx={{ 
                    mb: 2,
                    border: notification.read ? '1px solid #e0e0e0' : '1px solid #1976d2',
                    backgroundColor: notification.read ? '#f5f5f5' : '#e3f2fd'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={notification.read ? 'normal' : 'bold'}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Type: {notification.type} | Created: {new Date(notification.createdAt).toLocaleString()}
                        {notification.read && ` | Read: ${new Date(notification.readAt || notification.createdAt).toLocaleString()}`}
                      </Typography>
                      {!notification.read && (
                        <Button 
                          size="small" 
                          onClick={() => markAsRead(notification.id)}
                          variant="outlined"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={markAll}
              disabled={items.length === 0 || items.every(n => n.read)}
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

        {/* Troubleshooting */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting
          </Typography>
          
          <Typography variant="body2" paragraph>
            If notifications are not working in the admin area:
          </Typography>
          
          <ol>
            <li>Check if the backend is running and accessible</li>
            <li>Verify you are logged in with admin privileges</li>
            <li>Check browser console for error messages (look for [NOTIFY] logs)</li>
            <li>Verify the notification API endpoints are working</li>
            <li>Check if WebSocket connection is established</li>
            <li>Ensure NotificationProvider is wrapping the admin components</li>
          </ol>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Check the browser console for detailed logs starting with [NOTIFY] or [NOTIFY-WS]
          </Typography>
        </Paper>
      </Container>
    </AdminLayout>
  );
}