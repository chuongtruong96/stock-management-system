// src/hooks/api/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../../services/api';
import { toast } from 'react-toastify';

/**
 * Custom hook for order management with enhanced error handling and state management
 */
export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  // Fetch user's orders
  const fetchMyOrders = useCallback(async (page = 0, size = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.getMyOrders({ page, size });
      
      if (response.success) {
        setOrders(response.data.content || []);
        setPagination({
          page: response.data.number || 0,
          size: response.data.size || 20,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.create(orderData);
      
      if (response.success) {
        setCurrentOrder(response.data);
        toast.success('Order created successfully!');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export order PDF
  const exportOrderPDF = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.exportPDF(orderId);
      
      // Update current order status if it matches
      if (currentOrder && currentOrder.orderId === orderId) {
        setCurrentOrder(prev => ({
          ...prev,
          status: 'exported',
          updatedAt: new Date().toISOString(),
        }));
      }
      
      toast.success('PDF exported successfully!');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to export PDF';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Submit signed PDF
  const submitSignedPDF = useCallback(async (orderId, file) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.submitSigned(orderId, file);
      
      if (response.success) {
        // Update current order status if it matches
        if (currentOrder && currentOrder.orderId === orderId) {
          setCurrentOrder(response.data);
        }
        
        toast.success('Signed PDF uploaded successfully!');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit signed PDF');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit signed PDF';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOrder]);

  // Get order details
  const getOrderDetails = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.getOrderDetails(orderId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch order details');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch order details';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check order window status
  const checkOrderWindow = useCallback(async () => {
    try {
      const response = await orderApi.checkOrderWindow();
      return response.success ? response.data : { canOrder: false };
    } catch (err) {
      console.warn('Failed to check order window status:', err);
      return { canOrder: false };
    }
  }, []);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset current order
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    
    // Actions
    fetchMyOrders,
    createOrder,
    exportOrderPDF,
    submitSignedPDF,
    getOrderDetails,
    checkOrderWindow,
    clearError,
    clearCurrentOrder,
    setCurrentOrder,
  };
};

/**
 * Hook for order window management
 */
export const useOrderWindow = () => {
  const [windowStatus, setWindowStatus] = useState({ open: true, canOrder: true });
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [windowResponse, periodResponse] = await Promise.all([
        orderApi.getOrderWindowStatus(),
        orderApi.checkOrderPeriod(),
      ]);

      const isOpen = windowResponse.success ? windowResponse.data.open : true;
      const canOrder = periodResponse.success ? periodResponse.data.canOrder : true;

      setWindowStatus({ open: isOpen, canOrder });
      return { open: isOpen, canOrder };
    } catch (err) {
      console.warn('Failed to check order window status:', err);
      setWindowStatus({ open: true, canOrder: true });
      return { open: true, canOrder: true };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    windowStatus,
    loading,
    checkStatus,
  };
};

/**
 * Hook for order statistics (admin)
 */
export const useOrderStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.getStatistics();
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};

export default useOrders;