// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Enhanced API configuration with better error handling and performance optimizations
const resolveBaseURL = () => {
  // If env variable provided, respect it
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim() !== '') {
    return process.env.REACT_APP_API_URL;
  }
  // In development (running on port 3000) default to Spring Boot port 8082 to avoid proxy issues
  if (process.env.NODE_ENV === 'development' && window?.location?.port === '3000') {
    return 'http://localhost:8082/api';
  }
  // Fallback – same origin `/api`
  return '/api';
};

const api = axios.create({
    baseURL: resolveBaseURL(),
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
    // Enable request/response compression
    decompress: true,
});

// Request interceptor with enhanced error handling and logging
api.interceptors.request.use(
    (config) => {
        // Add timestamp for request tracking
        config.metadata = { startTime: new Date() };
        
        // Get authentication token
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (!config.url?.includes('/auth/')) {
                console.warn('No authentication token found for protected endpoint');
            }
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }

        // Note: Custom headers like X-Request-ID removed due to CORS restrictions
        // They can be re-enabled once backend CORS is properly configured
        
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request [${config.method?.toUpperCase()}]:`, {
                url: config.url,
                baseURL: config.baseURL,
                headers: config.headers,
                data: config.data,
                params: config.params,
            });
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
    (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime;
        
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response [${response.status}] (${duration}ms):`, {
                url: response.config.url,
                status: response.status,
                data: response.data,
                headers: response.headers,
            });
        }
        
        return response;
    },
    (error) => {
        const duration = error.config?.metadata ? 
            new Date() - error.config.metadata.startTime : 0;
            
        // Enhanced error logging
        console.error(`❌ API Error (${duration}ms):`, {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
        });

        // Handle different error scenarios with less intrusive notifications
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    // Unauthorized - clear auth and redirect to login
                    localStorage.removeItem('user');
                    toast.error('Session expired. Please login again.');
                    if (!window.location.pathname.includes('/auth/')) {
                        window.location.href = '/auth/login';
                    }
                    break;
                    
                case 403:
                    toast.error('Access denied. You don\'t have permission for this action.');
                    break;
                    
                case 404:
                    // Don't show toast for 404s as they might be expected during development
                    console.warn('Resource not found:', error.config?.url);
                    break;
                    
                case 422:
                    // Validation errors
                    const validationMessage = data?.message || 'Validation failed';
                    toast.error(validationMessage);
                    break;
                    
                case 429:
                    toast.error('Too many requests. Please try again later.');
                    break;
                    
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                    
                default:
                    // Only show toast for unexpected errors
                    if (status >= 500) {
                        const errorMessage = data?.message || `Server error (${status})`;
                        toast.error(errorMessage);
                    }
            }
        } else if (error.request) {
            // Network error - only show if not a development 404
            console.warn('Network error:', error.message);
        } else {
            // Other errors
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Utility Functions
export const unwrap = (r) => {
  // Handle ApiResponse wrapper from backend
  if (r.data && typeof r.data === 'object' && r.data.hasOwnProperty('success') && r.data.hasOwnProperty('data')) {
    // Backend ApiResponse format: {success: true, data: [...], message: "..."}
    return Array.isArray(r.data.data) ? r.data.data : r.data.data?.content || r.data.data;
  }
  // Legacy format: direct array or paginated response
  return Array.isArray(r.data) ? r.data : r.data.content;
};

export const normalize = (p) => ({
  ...p,
  id: p.id ?? p.productId,
});

export const unwrapArray = r => {
  // Handle ApiResponse wrapper
  if (r.data && typeof r.data === 'object' && r.data.hasOwnProperty('success') && r.data.hasOwnProperty('data')) {
    return r.data.data;
  }
  return r.data;
};

export const unwrapPage = r => {
  // Handle ApiResponse wrapper for paginated responses
  if (r.data && typeof r.data === 'object' && r.data.hasOwnProperty('success') && r.data.hasOwnProperty('data')) {
    // If it's a Page object, extract the content
    const data = r.data.data;
    if (data && data.content && Array.isArray(data.content)) {
      return data.content; // Return just the content array for DataGrid
    }
    return data;
  }
  // Handle direct Page object
  if (r.data && r.data.content && Array.isArray(r.data.content)) {
    return r.data.content;
  }
  return r.data;
};

// Auth API
export const authApi = {
    login: (credentials) => api.post("/auth/login", credentials).then((r) => r.data),
    forgotPassword: (payload) => api.post("/auth/forgot", payload).then(unwrap),
};

// User API
export const userApi = {
  getUserInfo: () => api.get("/users/me").then(unwrap),
  getUsers: () => api.get("/users").then(unwrap),
  addUser: (user) => api.post("/users", user).then(unwrap),
  updateUser: (userId, user) => api.put(`/users/${userId}`, user).then(unwrap),
  deleteUser: (userId) => api.delete(`/users/${userId}`).then(unwrap),
  // Legacy endpoints for backward compatibility
  getEmployees: () => api.get("/users").then(unwrap),
  addEmployee: (employee) => api.post("/users", employee).then(unwrap),
  updateEmployee: (employeeId, employee) => api.put(`/users/${employeeId}`, employee).then(unwrap),
  deleteEmployee: (employeeId) => api.delete(`/users/${employeeId}`).then(unwrap),
};

// Category API
export const categoryApi = {
  all: () => api.get("/categories").then(unwrap),
  getById: (id) => api.get(`/categories/${id}`).then(unwrap),
  create: (data) => api.post("/categories", data).then(unwrap),
  update: (id, data) => api.put(`/categories/${id}`, data).then(unwrap),
  delete: (id) => api.delete(`/categories/${id}`).then(unwrap),
  uploadIcon: (id, formData) =>
    api.post(`/categories/${id}/icon`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  getProductsByCat: (cid) => api.get(`/products?categoryId=${cid}`).then(unwrapPage),
};

// Product API
export const productApi = {
  list: async (catIdArr, page = 0, size = 12, sort = "", q = "") => {
    const params = { page, size, q };
    if (catIdArr !== null && catIdArr !== undefined && catIdArr !== "") {
      params.categoryId = catIdArr;
    }
    if (sort && sort !== "default") params.sort = sort;
    return api.get("/products", { params }).then(unwrapPage);
  },
  listMultiCats: async (catIds = [], page, size, ...rest) => {
    if (!catIds.length) {
      return productApi.list(null, page, size, ...rest);
    }
    const pages = await Promise.all(
      catIds.map((id) => productApi.list(id, page, size, ...rest))
    );
    return {
      content: pages.flatMap((p) => p.content),
      totalPages: Math.max(...pages.map((p) => p.totalPages)),
    };
  },
  byId: (id) => api.get(`/products/${id}`).then((r) => normalize(r.data)),
  top: (limit = 8) =>
    api
      .get("/orders/reports/products", { params: { top: limit } })
      .then((r) => r.data.map(normalize)),
  all: () => api.get("/products/all").then(unwrap), // Use /all endpoint for simple listing
  add: (body) => api.post("/products", body).then(unwrap),
  uploadImage: (id, formData) =>
    api.post(`/products/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  update: (productId, product) => api.put(`/products/${productId}`, product).then(unwrap),
  delete: (productId) => api.delete(`/products/${productId}`).then(unwrap),
  // New endpoints from ProductController
  getStats: () => api.get("/products/stats").then(unwrap),
  getTopOrdered: (limit = 10) => api.get("/products/top-ordered", { params: { limit } }).then(unwrap),
  getCategoryDistribution: () => api.get("/products/category-distribution").then(unwrap),
  byCategory: (categoryId) => api.get(`/products/category/${categoryId}`).then(unwrap),
};

// Order API
export const orderApi = {
  all: () => api.get("/orders").then(unwrapPage),
  byDepartment: (deptId) => api.get(`/orders/department/${deptId}`).then(unwrap),
  detail: (id) => api.get(`/orders/${id}/items`).then(unwrap),
  getItems: (id) => api.get(`/orders/${id}/items`).then(unwrap),
  track: (page = 0, size = 10) => api.get("/orders/mine", { params: { page, size } }).then(unwrap),
  create: (body) => api.post("/orders", body).then(unwrap),
  exportPdf: (id) => api.post(`/orders/${id}/export`, null, { responseType: "blob" }).then(unwrap),
  export: (id) => api.post(`/orders/${id}/export`, null, { responseType: "blob" }).then(unwrap), // Alias for backward compatibility
  uploadSignedPdf: (id, formData) =>
    api.put(`/orders/${id}/submit-signed`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  submitSigned: (id, formData) =>
    api.put(`/orders/${id}/submit-signed`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap), // Alias for backward compatibility
  confirm: (id) => api.put(`/orders/${id}`, { status: "pending" }).then(unwrap),
  approve: (orderId, comment) =>
    api.put(`/orders/${orderId}/approve`, { adminComment: comment }).then(unwrap),
  reject: (orderId, reason) =>
    api.put(`/orders/${orderId}/reject`, {}, { params: { reason } }).then(unwrap),
  updateComment: (orderId, comment) =>
    api.put(`/orders/${orderId}/comment`, { adminComment: comment }).then(unwrap),
  getPendingCount: () => api.get("/orders/pending-count").then(unwrap),
  getMonthlyCount: () => api.get("/orders/monthly-count").then(unwrap),
  getLatest: () => api.get("/orders/latest").then(unwrap),
  checkPeriod: () => api.get("/orders/check-period").then(unwrap),
  delete: (orderId) => api.delete(`/orders/${orderId}`).then(unwrap),
  // New endpoints from OrderController
  getPending: () => api.get("/orders/pending").then(unwrap),
  getSubmitted: () => api.get("/orders/submitted").then(unwrap),
  getReports: (month, year) => api.get("/orders/reports", { params: { month, year } }).then(unwrap),
  getLatestByDepartment: (departmentId) => api.get(`/orders/department/${departmentId}/latest`).then(unwrap),
  downloadSignedFile: (id) => api.get(`/orders/${id}/signed-file`, { responseType: "blob" }).then(unwrap),
  // Legacy endpoints for backward compatibility
  getHistory: () => api.get("/orders/pending").then(unwrap),
  getHistoryByDepartment: (departmentId) => api.get(`/orders/department/${departmentId}`).then(unwrap),
  import: (formData) =>
    api.post("/orders/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  update: (orderId, data) => api.put(`/orders/${orderId}`, data).then(unwrap),
};

// Order Window API
export const orderWindowApi = {
  getStatus: () => api.get("/orders/order-window/status").then(unwrap),
  check: () => api.get("/orders/order-window/status").then(unwrap), // Alias for backward compatibility
  toggle: () => api.post("/orders/order-window/toggle").then(unwrap),
};

// Unit API
export const unitApi = {
  all: () => api.get("/units").then(unwrap),
  getById: (id) => api.get(`/units/${id}`).then(unwrap),
  add: (unit) => api.post("/units", unit).then(unwrap),
  update: (unitId, unit) => api.put(`/units/${unitId}`, unit).then(unwrap),
  delete: (unitId) => api.delete(`/units/${unitId}`).then(unwrap),
};

// Department API
export const departmentApi = {
  all: () => api.get("/departments").then(unwrap),
  getById: (id) => api.get(`/departments/${id}`).then(unwrap),
  create: (department) => api.post("/departments", department).then(unwrap),
  update: (id, department) => api.put(`/departments/${id}`, department).then(unwrap),
  delete: (id) => api.delete(`/departments/${id}`).then(unwrap),
};

// Notification API
export const notificationApi = {
  fetch: () => api.get("/notifications").then(unwrap),
  markRead: (id) => api.put(`/notifications/${id}/read`).then(unwrap),
  announce: ({ title, message, link }) =>
    api.post("/notifications/announce", null, { params: { title, message, link } }).then(unwrap),
  getUnreadCount: () => api.get("/notifications/unread-count").then(unwrap),
  markAllRead: () => api.put("/notifications/mark-all-read").then(unwrap),
};

// Summary API (Integrated from summaryApi.js)
export const summaryApi = {
  fetch: (deptId, from, to) =>
    api.get("/summaries", { params: { deptId, from, to } }).then(unwrap),
  fetchDynamic: (deptId, from, to) =>
    api.get("/summaries/dynamic", { params: { deptId, from, to } }).then(unwrap),
  runRange: (from, to) =>
    api.post("/summaries/run", null, { params: { from, to } }).then(unwrap),
};

// Dashboard API - New comprehensive dashboard endpoints
export const dashboardApi = {
  // Overview stats
  getOverview: () => api.get("/dashboard/overview").then(unwrap),
  getQuickStats: () => api.get("/dashboard/quick-stats").then(unwrap),
  
  // Department stats
  getDepartmentStats: () => api.get("/dashboard/departments/stats").then(unwrap),
  getDepartmentsPendingOrders: () => api.get("/dashboard/departments/pending-orders").then(unwrap),
  
  // Order stats
  getCurrentMonthOrderStats: () => api.get("/dashboard/orders/current-month").then(unwrap),
  getMonthlyOrderSummary: (months = 12) => api.get("/dashboard/orders/monthly-summary", { params: { months } }).then(unwrap),
  getOrderStatusDistribution: () => api.get("/dashboard/orders/status-distribution").then(unwrap),
  getOrderSubmissionTimeline: () => api.get("/dashboard/orders/submission-timeline").then(unwrap),
  getOrderCompletionRate: () => api.get("/dashboard/orders/completion-rate").then(unwrap),
  getDocumentUploadSuccessRate: () => api.get("/dashboard/orders/document-upload-success").then(unwrap),
  
  // Product stats
  getProductStats: () => api.get("/dashboard/products/stats").then(unwrap),
  getTopOrderedProducts: (limit = 10) => api.get("/dashboard/products/top-ordered", { params: { limit } }).then(unwrap),
  getProductCategoryDistribution: () => api.get("/dashboard/products/category-distribution").then(unwrap),
  
  // Workflow stats
  getWorkflowStats: () => api.get("/dashboard/workflow/stats").then(unwrap),
  
  // Charts data
  getOrdersByStatusChart: () => api.get("/dashboard/charts/orders-by-status").then(unwrap),
  getProductsByCategoryChart: () => api.get("/dashboard/charts/products-by-category").then(unwrap),
  getMonthlyOrdersChart: (months = 6) => api.get("/dashboard/charts/monthly-orders", { params: { months } }).then(unwrap),
};

// Report API - Enhanced reporting endpoints
export const reportApi = {
  getSummary: (year, month) => api.get("/reports", { params: { year, month } }).then(unwrap),
  getFull: (year, month) => api.get("/reports/full", { params: { year, month } }).then(unwrap),
  exportExcel: (month) => api.get("/reports/export/excel", { params: { month }, responseType: "blob" }).then(unwrap),
  exportPdf: (month) => api.get("/reports/export/pdf", { params: { month }, responseType: "blob" }).then(unwrap),
};

export default api;