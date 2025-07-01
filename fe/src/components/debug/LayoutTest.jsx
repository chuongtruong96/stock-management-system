import React, { useContext } from "react";
import { Paper, Typography, Box, Chip, Alert } from "@mui/material";
import { AuthContext } from "context/AuthContext";

/**
 * Debug component to test layout detection
 * Shows current user role and expected layout
 */
export default function LayoutTest() {
  const { auth } = useContext(AuthContext);
  
  const isAdmin = auth?.user?.roles?.some(role => 
    role.toLowerCase() === "admin" || role.toLowerCase() === "role_admin"
  );

  return (
    <Paper sx={{ p: 3, m: 2, border: '2px solid #2196f3' }}>
      <Typography variant="h6" gutterBottom color="primary">
        🧪 Layout Detection Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Current User Info:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip 
            label={`Username: ${auth?.user?.username || 'Unknown'}`} 
            size="small" 
            color="info"
          />
          <Chip 
            label={`Roles: ${auth?.user?.roles?.join(', ') || 'None'}`} 
            size="small" 
            color="secondary"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Alert severity={isAdmin ? "success" : "info"}>
          <Typography variant="body2">
            <strong>Detected Role:</strong> {isAdmin ? "Admin" : "User"}
            <br />
            <strong>Expected Layout:</strong> {isAdmin ? "AdminLayout (with sidebar margin)" : "Container (user style)"}
            <br />
            <strong>Sidebar Overlay:</strong> {isAdmin ? "❌ Should NOT occur" : "✅ Not applicable"}
          </Typography>
        </Alert>
      </Box>

      <Typography variant="caption" color="text.secondary">
        This component helps verify that the NotificationPageWrapper is correctly detecting user roles
        and applying the appropriate layout to prevent sidebar overlay issues.
      </Typography>
    </Paper>
  );
}