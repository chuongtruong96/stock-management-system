import React, { useContext } from 'react';
import { Box, Typography, Button, Paper, Alert, Chip, Card, CardContent } from '@mui/material';
import { useNotifications } from 'context/NotificationContext';
import { useBackendStatus } from 'context/BackendStatusContext';
import { AuthContext } from 'context/AuthContext';
import { notificationApi } from 'services/api';

export default function AdminNotificationDebug() {
  const { items, markAsRead, markAll } = useNotifications();
  const { isBackendAvailable, isChecking, lastChecked } = useBackendStatus();
  const { auth } = useContext(AuthContext);

  const testNotificationAPI = async () => {
    try {
      console.log("[ADMIN-DEBUG] Testing notification API...");
      const result = await notificationApi.fetch();
      console.log("[ADMIN-DEBUG] API result:", result);
      alert(`API test successful! Found ${Array.isArray(result) ? result.length : 'unknown'} notifications`);
    } catch (error) {
      console.error("[ADMIN-DEBUG] API test failed:", error);
      alert(`API test failed: ${error.message}`);
    }
  };

  const testMarkAsRead = async () => {
    if (items.length === 0) {
      alert("No notifications to mark as read");
      return;
    }
    
    const firstUnread = items.find(item => !item.read);
    if (!firstUnread) {
      alert("No unread notifications found");
      return;
    }

    try {
      console.log("[ADMIN-DEBUG] Testing mark as read for:", firstUnread.id);
      await notificationApi.markRead(firstUnread.id);
      markAsRead(firstUnread.id);
      alert(`Successfully marked notification ${firstUnread.id} as read`);
    } catch (error) {
      console.error("[ADMIN-DEBUG] Mark as read failed:", error);
      alert(`Mark as read failed: ${error.message}`);
    }
  };

  return (
    <Card sx={{ m: 2, border: '2px solid #f44336' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="error">
          🔧 Admin Notification Debug Panel
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            System Status:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip 
              label={`Backend: ${isBackendAvailable ? "✅ Available" : "❌ Unavailable"}`} 
              color={isBackendAvailable ? "success" : "error"}
              size="small"
            />
            <Chip 
              label={`Checking: ${isChecking ? "🔄 Yes" : "⏸️ No"}`} 
              color={isChecking ? "warning" : "default"}
              size="small"
            />
          </Box>
          {lastChecked && (
            <Typography variant="caption" color="text.secondary">
              Last backend check: {lastChecked.toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Authentication:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip 
              label={`Auth: ${auth?.token ? "✅ Logged in" : "❌ Not logged in"}`} 
              color={auth?.token ? "success" : "error"}
              size="small"
            />
            <Chip 
              label={`Role: ${auth?.user?.roles?.join(', ') || 'Unknown'}`} 
              color="primary"
              size="small"
            />
          </Box>
          {auth?.user && (
            <Typography variant="caption" color="text.secondary">
              User: {auth.user.username} | Token: {auth.token ? `${auth.token.substring(0, 20)}...` : 'None'}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notifications Context:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip 
              label={`Total: ${items.length}`} 
              color="info"
              size="small"
            />
            <Chip 
              label={`Unread: ${items.filter(n => !n.read).length}`} 
              color="warning"
              size="small"
            />
            <Chip 
              label={`Read: ${items.filter(n => n.read).length}`} 
              color="success"
              size="small"
            />
          </Box>
        </Box>

        {items.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Sample Notifications:
            </Typography>
            {items.slice(0, 3).map((item) => (
              <Box key={item.id} sx={{ 
                mb: 1, 
                p: 1, 
                border: '1px solid #ddd', 
                borderRadius: 1,
                backgroundColor: item.read ? '#f5f5f5' : '#fff3cd'
              }}>
                <Typography variant="body2" fontWeight={item.read ? 'normal' : 'bold'}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {item.id} | Type: {item.type} | Read: {item.read ? 'Yes' : 'No'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={testNotificationAPI}
            color="primary"
          >
            Test API Fetch
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={testMarkAsRead}
            disabled={items.length === 0}
            color="secondary"
          >
            Test Mark as Read
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => markAll()}
            disabled={items.length === 0}
            color="success"
          >
            Mark All Read
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              console.log("[ADMIN-DEBUG] Current notification items:", items);
              console.log("[ADMIN-DEBUG] Auth context:", auth);
              console.log("[ADMIN-DEBUG] Backend status:", { isBackendAvailable, isChecking, lastChecked });
            }}
            color="info"
          >
            Log to Console
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => window.location.reload()}
            color="warning"
          >
            Reload Page
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Debug Tips:
            <br />• Check browser console for [NOTIFY] and [NOTIFY-WS] logs
            <br />• Verify backend is running on correct port
            <br />• Check if WebSocket connection is established
            <br />• Ensure notification API endpoints are accessible
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}