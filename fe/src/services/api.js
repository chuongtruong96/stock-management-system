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
    console.log("Request:", config);
    return config;
}, (error) => {
    return Promise.reject(error);
  }
);

// Utility Functions
export const unwrap = (r) => (Array.isArray(r.data) ? r.data : r.data.content);
export const normalize = (p) => ({
  ...p,
  id: p.id ?? p.productId,
});

// Auth API
export const authApi = {
    login: (credentials) =>
   api.post("/auth/login", credentials).then((r) => r.data),
  forgotPassword: (payload) => api.post("/auth/forgot", payload).then(unwrap),
};

// User API
export const userApi = {
  getUserInfo: () => api.get("/users/me").then(unwrap),
  getUsers: () => api.get("/admin/users").then(unwrap),
  addUser: (user) => api.post("/admin/users", user).then(unwrap),
  updateUser: (userId, user) => api.put(`/admin/users/${userId}`, user).then(unwrap),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`).then(unwrap),
  getEmployees: () => api.get("/admin/employees").then(unwrap),
  addEmployee: (employee) => api.post("/admin/employees", employee).then(unwrap),
  updateEmployee: (employeeId, employee) =>
    api.put(`/admin/employees/${employeeId}`, employee).then(unwrap),
  deleteEmployee: (employeeId) => api.delete(`/admin/employees/${employeeId}`).then(unwrap),
};

// Category API
export const categoryApi = {
  all: () => api.get("/categories").then(unwrap),
  create: (data) => api.post("/categories", data).then(unwrap),
  update: (id, data) => api.put(`/categories/${id}`, data).then(unwrap),
  delete: (id) => api.delete(`/categories/${id}`).then(unwrap),
  uploadIcon: (id, formData) =>
    api.post(`/categories/${id}/icon`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  getProductsByCat: (cid) => api.get(`/products?categoryId=${cid}`).then(unwrap),
};

// Product API
export const productApi = {
  list: async (catIdArr, page = 0, size = 12, sort = "", q = "") => {
    const params = { page, size, q };
    if (catIdArr !== null && catIdArr !== undefined && catIdArr !== "") {
      params.categoryId = catIdArr;
    }
    if (sort && sort !== "default") params.sort = sort;
    return api.get("/products", { params }).then(unwrap);
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
  all: () => api.get("/products").then(unwrap),
  add: (body) => api.post("/products", body).then(unwrap),
  uploadImage: (id, formData) =>
    api.post(`/products/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  update: (productId, product) => api.put(`/products/${productId}`, product).then(unwrap),
  delete: (productId) => api.delete(`/products/${productId}`).then(unwrap),
};

// Order API
export const orderApi = {
  all: () => api.get("/orders").then(unwrap),
  byDepartment: (deptId) => api.get(`/orders/by-department/${deptId}`).then(unwrap),
  detail: (id) => api.get(`/orders/${id}/items`).then(unwrap),
  track: (page = 0, size = 10) => api.get("/orders/mine", { params: { page, size } }).then(unwrap),
  create: (body) => api.post("/orders", body).then(unwrap),
  exportPdf: (id) => api.post(`/orders/${id}/export`, null, { responseType: "blob" }).then(unwrap),
  uploadSignedPdf: (id, formData) =>
    api.put(`/orders/${id}/submit-signed`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  confirm: (id) => api.put(`/orders/${id}`, { status: "pending" }).then(unwrap),
  approve: (orderId, comment) =>
    api.put(`/orders/${orderId}/approve`, { adminComment: comment }).then(unwrap),
  reject: (orderId, comment) =>
    api.put(`/orders/${orderId}/reject`, {}, { params: { comment } }).then(unwrap),
  getPendingCount: () => api.get("/orders/pending-count").then(unwrap),
  getMonthlyCount: () => api.get("/orders/monthly-count").then(unwrap),
  getLatest: () => api.get("/orders/latest").then(unwrap),
  checkPeriod: () => api.get("/orders/check-period").then(unwrap),
  delete: (orderId) => api.delete(`/orders/${orderId}`).then(unwrap),
  getHistory: () => api.get("/orders/history").then(unwrap),
  getHistoryByDepartment: (departmentId) =>
    api.get(`/orders/history?departmentId=${departmentId}`).then(unwrap),
  import: (formData) =>
    api.post("/orders/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(unwrap),
  update: (orderId, data) => api.put(`/orders/${orderId}`, data).then(unwrap),
};

// Order Window API
export const orderWindowApi = {
  getStatus: () => api.get("/orders/order-window/status").then(unwrap),
  toggle: () => api.post("/orders/order-window/toggle").then(unwrap),
};

// Unit API
export const unitApi = {
  all: () => api.get("/units").then(unwrap),
  add: (unit) => api.post("/units", unit).then(unwrap),
  update: (unitId, unit) => api.put(`/units/${unitId}`, unit).then(unwrap),
  delete: (unitId) => api.delete(`/units/${unitId}`).then(unwrap),
};

// Department API
export const departmentApi = {
  all: () => api.get("/departments").then(unwrap),
};

// Notification API
export const notificationApi = {
  fetch: () => api.get("/notifications").then(unwrap),
  markRead: (id) => api.put(`/notifications/${id}/read`).then(unwrap),
  announce: ({ title, message, link }) =>
    api.post("/notifications/announce", null, { params: { title, message, link } }).then(unwrap),
};

// Summary API (Integrated from summaryApi.js)
export const summaryApi = {
  fetch: (deptId, from, to) =>
    api.get("/summaries", { params: { deptId, from, to } }).then(unwrap),
};

export default api;