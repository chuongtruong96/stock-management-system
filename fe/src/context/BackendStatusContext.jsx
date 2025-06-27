// src/context/BackendStatusContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const BackendStatusContext = createContext();

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error('useBackendStatus must be used within BackendStatusProvider');
  }
  return context;
};

export const BackendStatusProvider = ({ children }) => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const getBackendUrl = () => {
    // Check if we're on Netlify (production)
    if (window?.location?.hostname?.includes('netlify.app')) {
      return 'https://stock-management-system-1-p6xu.onrender.com/api/categories';
    }
    
    // In development, use localhost
    if (process.env.NODE_ENV === 'development' && window?.location?.port === '3000') {
      return 'http://localhost:8080/api/categories';
    }
    
    // Production fallback
    if (process.env.NODE_ENV === 'production') {
      return 'https://stock-management-system-1-p6xu.onrender.com/api/categories';
    }
    
    // Development fallback
    return 'http://localhost:8080/api/categories';
  };

  const checkBackendStatus = async () => {
    try {
      setIsChecking(true);
      
      // Try a simple API endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(getBackendUrl(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401) {
        // 401 means server is running but needs auth - that's fine
        setIsBackendAvailable(true);
        console.log('✅ Backend is available');
      } else {
        setIsBackendAvailable(false);
        console.warn('⚠️ Backend responded with status:', response.status);
      }
    } catch (error) {
      setIsBackendAvailable(false);
      console.warn('❌ Backend not available:', error.message);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    isBackendAvailable,
    isChecking,
    lastChecked,
    recheckBackend: checkBackendStatus,
  };

  return (
    <BackendStatusContext.Provider value={value}>
      {children}
    </BackendStatusContext.Provider>
  );
};