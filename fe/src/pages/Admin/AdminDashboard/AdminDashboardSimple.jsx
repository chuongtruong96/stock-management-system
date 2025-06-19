import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AdminLayout from "layouts/AdminLayout";
import useAdminData from "hooks/useAdminData";

export default function AdminDashboardSimple() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const {
    orders = [],
    pendingCount = 0,
    monthlyOrders = 0,
    products = [],
    winOpen = false,
    loading = false,
    error = null,
  } = useAdminData();

  if (loading) {
    return (
      <AdminLayout titleKey="adminDashboard" icon="dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout titleKey="adminDashboard" icon="dashboard">
        <Alert severity="error">
          Error loading dashboard: {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="adminDashboard" icon="dashboard">
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="primary">
                {pendingCount}
              </Typography>
              <Typography variant="body2">
                Pending Orders
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="info.main">
                {monthlyOrders}
              </Typography>
              <Typography variant="body2">
                Monthly Orders
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="success.main">
                {products.length}
              </Typography>
              <Typography variant="body2">
                Total Products
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="warning.main">
                {orders.length}
              </Typography>
              <Typography variant="body2">
                Total Orders
              </Typography>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Order Window Status: {winOpen ? "Open" : "Closed"}
          </Typography>
        </Box>
      </Box>
    </AdminLayout>
  );
}