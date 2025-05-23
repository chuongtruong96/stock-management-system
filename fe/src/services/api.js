// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8082/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user')); // Get the user object
    const token = user?.token; // Extract the token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('No token found in localStorage under "user" key');
    }
    console.log('Request:', config); // Log to verify
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const forgotPassword = (payload) => api.post("/auth/forgot", payload);

export const getUserInfo = () => api.get('/users/me');
export const getProducts = () => api.get('/products');
export const addProduct = (product) => api.post('/products', product);
export const updateProduct = (productId, product) => api.put(`/products/${productId}`, product);
export const deleteProduct = (productId) => api.delete(`/products/${productId}`);
export const updateStock = (productId, stock) => api.put(`/products/${productId}/stock`, { stock });
export const getLowStockProducts = () => api.get('/low-stock');
export const getOrders = () => api.get('/orders');
export const getOrdersByDepartment = (departmentId) => api.get(`/orders?departmentId=${departmentId}`);
export const getOrderItems = (orderId) => api.get(`/orders/${orderId}/items`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const approveOrder = (orderId) => api.put(`/orders/${orderId}/approve`);
export const rejectOrder = (orderId, comment) => api.put(`/orders/${orderId}/reject`, {}, { params: { comment } });
export const getPendingOrdersCount = () => api.get('/orders/pending-count');
export const getMonthlyOrdersCount = () => api.get('/orders/monthly-count');
export const getLatestOrder = () => api.get('/orders/latest');
export const checkOrderPeriod = () => api.get('/orders/check-period');
export const deleteOrder = (orderId) => api.delete(`/orders/${orderId}`);
export const getOrderHistory = () => api.get('/orders/history');
export const getOrderHistoryByDepartment = (departmentId) => api.get(`/orders/history?departmentId=${departmentId}`);

export const getUnits = () => api.get('/units');
export const addUnit = (unit) => api.post('/units', unit);
export const updateUnit = (unitId, unit) => api.put(`/units/${unitId}`, unit);
export const deleteUnit = (unitId) => api.delete(`/units/${unitId}`);
export const getDepartments = () => api.get('/departments');
export const getUsers = () => api.get('/admin/users');
export const addUser = (user) => api.post('/admin/users', user);
export const updateUser = (userId, user) => api.put(`/admin/users/${userId}`, user);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getEmployees = () => api.get('/admin/employees');
export const addEmployee = (employee) => api.post('/admin/employees', employee);
export const updateEmployee = (employeeId, employee) => api.put(`/admin/employees/${employeeId}`, employee);
export const deleteEmployee = (employeeId) => api.delete(`/admin/employees/${employeeId}`);
export const importOrders = (formData) => api.post('/orders/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

export const getWindowStatus = () => api.get('/orders/order-window/status');
export const toggleWindow    = () => api.post('/orders/order-window/toggle');
export const updateOrder = (orderId, data) => api.put(`/orders/${orderId}`, data);

export const fetchNotifications = () => api.get('/notifications');
export const markRead = id => api.put(`/notifications/${id}/read`);
export const announce = ({ title, message, link }) => api.post('/notifications/announce', null, { params: { title, message, link } });
export default api;