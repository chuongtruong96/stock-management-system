// src/components/order/OrderForm/components/OrderActionPanel.jsx
import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  History as HistoryIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import ActionButton from '../../../common/buttons/ActionButton';

/**
 * Order action panel with step-by-step workflow
 */
const OrderActionPanel = ({
  order,
  canOrder,
  hasItems,
  loading,
  onCreateOrder,
  onExportPDF,
  onUploadSigned,
  onContinueShopping,
  onViewHistory,
}) => {
  const getActionContent = () => {
    // Step 1: Create Order (when no order exists)
    if (!order) {
      return (
        <ActionButton
          step="Step 1"
          stepTitle="Create Your Order"
          stepDescription="Review your items and create the order to begin the approval process"
          stepColor="primary"
          disabled={!hasItems || !canOrder}
          loading={loading}
          onClick={onCreateOrder}
          startIcon={<SendIcon />}
          fullWidth
        >
          🚀 Create Order
        </ActionButton>
      );
    }

    // Step 2: Export PDF (when order is pending)
    if (order.status === 'pending') {
      return (
        <ActionButton
          step="Step 2"
          stepTitle="Export PDF for Signature"
          stepDescription="Download the order form PDF and get it signed by your department head"
          stepColor="info"
          loading={loading}
          onClick={onExportPDF}
          startIcon={<DownloadIcon />}
          fullWidth
        >
          📄 Export PDF
        </ActionButton>
      );
    }

    // Step 3: Upload Signed PDF (when order is exported)
    if (order.status === 'exported') {
      return (
        <ActionButton
          step="Step 3"
          stepTitle="Upload Signed PDF"
          stepDescription="Upload the signed PDF to submit your order for admin approval"
          stepColor="warning"
          loading={loading}
          onClick={onUploadSigned}
          startIcon={<UploadIcon />}
          fullWidth
        >
          📤 Upload Signed PDF
        </ActionButton>
      );
    }

    // Step 4: Waiting for Approval (when order is submitted)
    if (order.status === 'submitted') {
      return (
        <ActionButton
          step="Step 4"
          stepTitle="Waiting for Admin Approval"
          stepDescription="Your order has been submitted and is waiting for admin approval"
          stepColor="success"
          disabled
          fullWidth
        >
          ⏳ Waiting for Admin Approval
        </ActionButton>
      );
    }

    // Final Step: Order Completed (approved/rejected)
    if (order.status === 'approved') {
      return (
        <ActionButton
          step="✅"
          stepTitle="Order Approved!"
          stepDescription="Your order has been approved and will be processed"
          stepColor="success"
          onClick={onViewHistory}
          startIcon={<HistoryIcon />}
          fullWidth
        >
          📋 View Order History
        </ActionButton>
      );
    }

    if (order.status === 'rejected') {
      return (
        <ActionButton
          step="❌"
          stepTitle="Order Rejected"
          stepDescription="Your order has been rejected. Please check admin comments and try again"
          stepColor="error"
          onClick={onViewHistory}
          startIcon={<HistoryIcon />}
          fullWidth
        >
          📋 View Order History
        </ActionButton>
      );
    }

    return null;
  };

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
        ⚡ Actions
      </Typography>

      {/* Main Action */}
      <Box sx={{ mb: 3 }}>
        {getActionContent()}
      </Box>

      {/* Additional Information */}
      {!canOrder && !order && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
          <Typography variant="body2" color="warning.contrastText" fontWeight={500}>
            ⚠️ Order window is currently closed. You can only order during the first week of each month.
          </Typography>
        </Box>
      )}

      {!hasItems && !order && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="body2" color="info.contrastText" fontWeight={500}>
            ℹ️ Add items to your cart before creating an order.
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Secondary Actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="text"
          size="large"
          onClick={onContinueShopping}
          startIcon={<ShoppingCartIcon />}
          sx={{ fontWeight: 500 }}
        >
          🛍️ Continue Shopping
        </Button>

        <Button
          variant="text"
          size="large"
          onClick={onViewHistory}
          startIcon={<HistoryIcon />}
          sx={{ fontWeight: 500 }}
        >
          📋 Order History
        </Button>
      </Stack>
    </Paper>
  );
};

OrderActionPanel.propTypes = {
  order: PropTypes.shape({
    status: PropTypes.string.isRequired,
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  canOrder: PropTypes.bool.isRequired,
  hasItems: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  onCreateOrder: PropTypes.func.isRequired,
  onExportPDF: PropTypes.func.isRequired,
  onUploadSigned: PropTypes.func.isRequired,
  onContinueShopping: PropTypes.func.isRequired,
  onViewHistory: PropTypes.func.isRequired,
};

export default OrderActionPanel;