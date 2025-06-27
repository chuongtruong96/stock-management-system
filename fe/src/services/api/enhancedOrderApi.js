// src/services/api/enhancedOrderApi.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Base API configuration
const resolveApiBaseUrl = () => {
  // If env variable provided, respect it
  if (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim() !== '') {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Check if we're on Netlify (production)
  if (window?.location?.hostname?.includes('netlify.app')) {
    return 'https://stock-management-system-1-p6xu.onrender.com/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:8080/api';
};

const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    // Handle different response formats
    if (response.data && typeof response.data === 'object') {
      // If response has success field, return as is
      if ('success' in response.data) {
        return response.data;
      }
      
      // Otherwise, wrap in success format
      return {
        success: true,
        data: response.data,
        message: 'Request successful',
        timestamp: new Date().toISOString(),
      };
    }
    
    return response.data;
  },
  (error) => {
    const errorResponse = {
      success: false,
      message: 'An error occurred',
      data: null,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      errorResponse.message = data?.message || `HTTP ${status} Error`;
      errorResponse.errors = data?.errors || [];
      errorResponse.data = data?.data || null;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          errorResponse.message = 'Authentication required. Please log in.';
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 403:
          errorResponse.message = 'Access denied. Insufficient permissions.';
          break;
        case 404:
          errorResponse.message = 'Resource not found.';
          break;
        case 422:
          errorResponse.message = 'Validation failed. Please check your input.';
          break;
        case 500:
          errorResponse.message = 'Server error. Please try again later.';
          break;
      }
    } else if (error.request) {
      // Network error
      errorResponse.message = 'Network error. Please check your connection.';
    } else {
      // Other error
      errorResponse.message = error.message || 'An unexpected error occurred.';
    }

    return Promise.reject(errorResponse);
  }
);

/**
 * Enhanced Order API with improved error handling and response formatting
 */
export const enhancedOrderApi = {
  // Create new order
  async create(orderData) {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Get user's orders with pagination
  async getMyOrders(params = {}) {
    try {
      const { page = 0, size = 20, ...otherParams } = params;
      const response = await apiClient.get('/orders/mine', {
        params: { page, size, ...otherParams },
      });
      return response;
    } catch (error) {
      console.error('Get my orders error:', error);
      throw error;
    }
  },

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('Get order details error:', error);
      throw error;
    }
  },

  // Export order PDF
  async exportPDF(orderId) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/export`, {}, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'PDF exported successfully',
        data: { orderId, downloadUrl: url },
      };
    } catch (error) {
      console.error('Export PDF error:', error);
      throw error;
    }
  },

  // Submit signed PDF
  async submitSigned(orderId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.put(`/orders/${orderId}/submit-signed`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      return response;
    } catch (error) {
      console.error('Submit signed PDF error:', error);
      throw error;
    }
  },

  // Admin: Approve order
  async approveOrder(orderId, adminComment = '') {
    try {
      const response = await apiClient.put(`/orders/${orderId}/approve`, {
        adminComment,
      });
      return response;
    } catch (error) {
      console.error('Approve order error:', error);
      throw error;
    }
  },

  // Admin: Reject order
  async rejectOrder(orderId, reason) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/reject`, null, {
        params: { reason },
      });
      return response;
    } catch (error) {
      console.error('Reject order error:', error);
      throw error;
    }
  },

  // Get order window status
  async getOrderWindowStatus() {
    try {
      const response = await apiClient.get('/orders/order-window/status');
      return response;
    } catch (error) {
      console.error('Get order window status error:', error);
      throw error;
    }
  },

  // Check order period
  async checkOrderPeriod() {
    try {
      const response = await apiClient.get('/orders/check-period');
      return response;
    } catch (error) {
      console.error('Check order period error:', error);
      throw error;
    }
  },

  // Admin: Toggle order window
  async toggleOrderWindow() {
    try {
      const response = await apiClient.post('/orders/order-window/toggle');
      return response;
    } catch (error) {
      console.error('Toggle order window error:', error);
      throw error;
    }
  },

  // Get order statistics (admin)
  async getStatistics() {
    try {
      const response = await apiClient.get('/orders/statistics/summary');
      return response;
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw error;
    }
  },

  // Get monthly report (admin)
  async getMonthlyReport(month, year, params = {}) {
    try {
      const { page = 0, size = 50, ...otherParams } = params;
      const response = await apiClient.get('/orders/reports/monthly', {
        params: { month, year, page, size, ...otherParams },
      });
      return response;
    } catch (error) {
      console.error('Get monthly report error:', error);
      throw error;
    }
  },

  // Download signed file
  async downloadSignedFile(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}/signed-file`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${orderId}-signed.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'File downloaded successfully',
        data: { orderId, downloadUrl: url },
      };
    } catch (error) {
      console.error('Download signed file error:', error);
      throw error;
    }
  },
};

/**
 * Enhanced User API
 */
export const enhancedUserApi = {
  // Get current user info with enhanced response handling
  async getUserInfo() {
    try {
      const response = await apiClient.get('/users/me');
      
      // Ensure we have the required fields with fallbacks
      const userData = response.data || response;
      
      return {
        success: true,
        data: {
          id: userData.id || userData.userId,
          username: userData.username || 'Unknown User',
          email: userData.email || '',
          fullName: userData.fullName || userData.name || '',
          department: userData.department || { name: userData.departmentName || 'Unknown Department' },
          departmentName: userData.departmentName || userData.department?.name || 'Unknown Department',
          role: userData.role || { name: 'USER' },
          ...userData,
        },
        message: 'User information retrieved successfully',
      };
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await apiClient.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};

/**
 * Utility functions for API handling
 */
export const apiUtils = {
  // Handle API response consistently
  handleResponse(response) {
    if (response && response.success !== undefined) {
      return response;
    }
    
    // Wrap non-standard responses
    return {
      success: true,
      data: response,
      message: 'Request successful',
    };
  },

  // Handle API errors consistently
  handleError(error) {
    if (error && error.success === false) {
      return error;
    }
    
    return {
      success: false,
      message: error.message || 'An error occurred',
      data: null,
      errors: error.errors || [],
    };
  },

  // Show success toast
  showSuccess(message) {
    toast.success(message);
  },

  // Show error toast
  showError(error) {
    const message = typeof error === 'string' ? error : error.message || 'An error occurred';
    toast.error(message);
  },
};

export default {
  orders: enhancedOrderApi,
  users: enhancedUserApi,
  utils: apiUtils,
};