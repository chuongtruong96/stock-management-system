// src/services/api-fixed.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Force the correct API URL for production
const getApiBaseUrl = () => {
  const hostname = window?.location?.hostname;
  console.log('🔍 API-FIXED: Current hostname:', hostname);
  
  if (hostname?.includes('netlify.app')) {
    const url = 'https://stock-management-system-1-p6xu.onrender.com/api';
    console.log('🔍 API-FIXED: Using Render backend:', url);
    return url;
  }
  
  if (hostname === 'localhost' && window?.location?.port === '3000') {
    const url = 'http://localhost:8080/api';
    console.log('🔍 API-FIXED: Using localhost backend:', url);
    return url;
  }
  
  // Fallback to Render for any other case
  const url = 'https://stock-management-system-1-p6xu.onrender.com/api';
  console.log('🔍 API-FIXED: Using fallback Render backend:', url);
  return url;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API-FIXED Request [${config.method?.toUpperCase()}]:`, {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    
    // Add auth token
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API-FIXED Response [${response.status}]:`, {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error(`❌ API-FIXED Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Auth API with fixed endpoints
export const authApiFixed = {
  login: (credentials) => {
    console.log('🔍 AUTH-FIXED: Attempting login with:', credentials);
    return api.post("/auth/login", credentials).then((r) => r.data);
  },
};

export default api;