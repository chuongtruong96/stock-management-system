import React from "react";
import { 
  Typography, 
  List, 
  Skeleton, 
  Box, 
  Paper,
  Alert,
  Stack,
  Container,
  Button,
  Chip,
} from "@mui/material";
import {
  History as HistoryIcon,
  Receipt as OrderIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useOrderHistory } from "hooks/useOrderHistory";
import { useTranslation } from "react-i18next";
import OrderHistoryItem from "./OrderHistoryItem";
import LoadingSpinner from "components/common/LoadingSpinner";

export default function OrderHistory() {
  const { t } = useTranslation('orders');
  const navigate = useNavigate();
  const { data: history, isLoading: loading, error } = useOrderHistory();

  if (loading) {
    return <LoadingSpinner message={t('page.loading')} />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)',
          }}
        >
          {error.message || t('page.error')}
        </Alert>
      </Container>
    );
  }

  const orders = Array.isArray(history) ? history : [];
  
  // Find pending order for quick access
  const pendingStatuses = ['pending', 'exported', 'uploaded', 'submitted'];
  const pendingOrder = orders.find(order => pendingStatuses.includes(order.status));

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <HistoryIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {t('history.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('history.ordersFound', { count: orders.length })}
              </Typography>
            </Box>
          </Stack>

          {/* Continue Pending Order Button */}
          {pendingOrder && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={t('history.pendingOrderChip', { 
                  orderNumber: pendingOrder.orderId || pendingOrder.id, 
                  status: pendingOrder.status 
                })}
                color="warning"
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate('/order-form')}
                sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                  },
                }}
              >
                {t('history.continuePendingOrder')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      {orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <OrderIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
            {t('history.noOrdersTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('history.noOrdersMessage')}
          </Typography>
        </Paper>
      ) : (
        <List sx={{ p: 0 }}>
          {orders.map((order, index) => (
            <OrderHistoryItem 
              key={order?.orderId || order?.id || index} 
              order={order} 
            />
          ))}
        </List>
      )}
    </Container>
  );
}