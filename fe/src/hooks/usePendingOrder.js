import { useState, useEffect } from 'react';
import { orderApi } from 'services/api';

export const usePendingOrder = () => {
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's orders and find the most recent pending one
      const orders = await orderApi.track(0, 10); // Get first 10 orders
      console.log('🔍 usePendingOrder: Fetched orders:', orders);
      
      // Find the most recent order that's not completed (approved/rejected)
      const pendingStatuses = ['pending', 'exported', 'uploaded', 'submitted'];
      const pending = Array.isArray(orders) 
        ? orders.find(order => pendingStatuses.includes(order.status))
        : null;
      
      console.log('🔍 usePendingOrder: Found pending order:', pending);
      setPendingOrder(pending);
      
    } catch (err) {
      console.error('❌ usePendingOrder: Error fetching pending order:', err);
      setError(err);
      setPendingOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated
    const user = localStorage.getItem('user');
    if (user) {
      fetchPendingOrder();
    } else {
      setLoading(false);
    }
  }, []);

  const refresh = () => {
    fetchPendingOrder();
  };

  return {
    pendingOrder,
    loading,
    error,
    refresh,
    hasPendingOrder: !!pendingOrder
  };
};