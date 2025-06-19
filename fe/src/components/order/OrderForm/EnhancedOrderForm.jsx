// src/components/order/OrderForm/EnhancedOrderForm.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Components
import PageHeader from '../../common/layout/PageHeader';
import ProgressCard from '../../common/cards/ProgressCard';
import OrderItemsTable from './components/OrderItemsTable';
import OrderActionPanel from './components/OrderActionPanel';
import UploadSignedDialog from '../../dialogs/UploadSignedDialog';

// Hooks and Context
import { useCart } from '../../../context/CartContext/useCart';
import { WsContext } from '../../../context/WsContext';
import { useOrders, useOrderWindow } from '../../../hooks/api/useOrders';

// Services and Utils
import { userApi } from '../../../services/api';
import { ORDER_STATUS_CONFIG, getCurrentStepIndex, ORDER_WORKFLOW_STEPS } from '../../../utils/constants/orderStatus';

/**
 * Enhanced OrderForm component with improved UI/UX and complete workflow
 */
const EnhancedOrderForm = () => {
  // State
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { subscribe } = useContext(WsContext);
  const { items, clear } = useCart();
  
  // Custom hooks
  const {
    currentOrder,
    loading: orderLoading,
    createOrder,
    exportOrderPDF,
    submitSignedPDF,
    setCurrentOrder,
  } = useOrders();
  
  const { windowStatus } = useOrderWindow();

  // Fetch user information with enhanced error handling
  useEffect(() => {
    const fetchUserInfo = async () => {
      setUserLoading(true);
      try {
        const response = await userApi.getUserInfo();
        console.log('Enhanced user response:', response);
        
        // Handle different response formats
        let userData;
        if (response.success) {
          userData = response.data;
        } else if (response.data) {
          userData = response.data;
        } else {
          userData = response;
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        toast.error(t('messages.userInfoError') || 'Failed to load user information');
        
        // Set fallback user data
        setUser({
          username: 'Unknown User',
          department: { name: 'Unknown Department' },
          departmentName: 'Unknown Department',
        });
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserInfo();
  }, [t]);

  // WebSocket subscription for order window updates
  useEffect(() => {
    let unsubscribe;
    
    const setupWebSocket = async () => {
      try {
        unsubscribe = await subscribe('/topic/order-window', ({ open }) => {
          toast.info(open ? '✅ Order window opened' : '⏰ Order window closed');
        });
      } catch (error) {
        console.warn('Failed to setup WebSocket subscription:', error);
      }
    };

    setupWebSocket();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // Enhanced user info extraction
  const getUserInfo = () => {
    if (!user) return { username: 'Loading...', departmentName: 'Loading...' };
    
    const username = user.username || user.name || 'Unknown User';
    const departmentName = 
      user.departmentName ||
      user.department?.name ||
      user.department?.departmentName ||
      user.dept?.name ||
      'Unknown Department';
    
    return { username, departmentName };
  };

  // Event handlers
  const handleCreateOrder = async () => {
    if (!windowStatus.canOrder) {
      toast.warning(t('messages.orderWindowClosed') || 'Order window is currently closed');
      return;
    }

    if (!items.length) {
      toast.error(t('messages.noItemsInCart') || 'No items in cart');
      return;
    }

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id || item.product.productId,
          quantity: item.qty,
        })),
      };

      const newOrder = await createOrder(orderData);
      clear(); // Clear cart after successful order creation
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleExportPDF = async () => {
    if (!currentOrder) return;
    
    try {
      await exportOrderPDF(currentOrder.orderId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUploadSigned = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = async (file) => {
    if (!currentOrder) return;
    
    try {
      await submitSignedPDF(currentOrder.orderId, file);
      setUploadDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewHistory = () => {
    navigate('/order-history');
  };

  // Get current order status configuration
  const statusConfig = currentOrder ? ORDER_STATUS_CONFIG[currentOrder.status] : null;
  const currentStepIndex = currentOrder ? getCurrentStepIndex(currentOrder.status) : 0;
  const { username, departmentName } = getUserInfo();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Enhanced Page Header */}
      <PageHeader
        title="Order Form"
        subtitle="Create and manage your stationery orders"
        icon="📋"
        status={statusConfig?.label}
        statusColor={statusConfig?.color}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Order Form' },
        ]}
        infoCards={[
          {
            title: 'Department',
            value: departmentName,
            icon: '🏢',
          },
          {
            title: 'Username',
            value: username,
            icon: '👤',
          },
          {
            title: 'Date',
            value: new Date().toLocaleDateString(),
            icon: '📅',
          },
        ]}
      />

      {/* Order Window Status Alert */}
      {!windowStatus.canOrder && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          ⚠️ {t('messages.orderWindowClosed') || 'Order window is currently closed. You can only order during the first week of each month.'}
        </Alert>
      )}

      {/* Order Progress */}
      {currentOrder && (
        <ProgressCard
          title="Order Progress"
          subtitle={`Order #${currentOrder.orderId || 'N/A'}`}
          progress={statusConfig?.progress || 0}
          status={statusConfig?.label}
          statusColor={statusConfig?.color}
          description={statusConfig?.description}
          steps={ORDER_WORKFLOW_STEPS.map(step => ({
            title: step.title,
            description: step.description,
          }))}
          currentStep={currentStepIndex}
          variant="gradient"
          color="auto"
          icon="🚀"
          sx={{ mb: 3 }}
        />
      )}

      {/* Order Items Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
          📦 Order Items
        </Typography>
        
        <OrderItemsTable
          items={items}
          loading={userLoading}
          emptyMessage="Your cart is empty. Add some items to get started!"
        />
      </Paper>

      {/* Order Actions */}
      <OrderActionPanel
        order={currentOrder}
        canOrder={windowStatus.canOrder}
        hasItems={items.length > 0}
        loading={orderLoading}
        onCreateOrder={handleCreateOrder}
        onExportPDF={handleExportPDF}
        onUploadSigned={handleUploadSigned}
        onContinueShopping={handleContinueShopping}
        onViewHistory={handleViewHistory}
      />

      {/* Upload Dialog */}
      {currentOrder && (
        <UploadSignedDialog
          open={uploadDialogOpen}
          order={currentOrder}
          onClose={() => setUploadDialogOpen(false)}
          onUpload={handleUploadComplete}
        />
      )}
    </Box>
  );
};

export default EnhancedOrderForm;