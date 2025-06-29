import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderWindowApi } from "../services/api";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const OrderWindowCtx = createContext({ canOrder: false });

export function OrderWindowProvider({ children }) {
  const { auth } = useContext(AuthContext); // Add AuthContext
  const [isReady, setIsReady] = useState(false);

  // Add a delay before enabling the query to prevent early API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000); // Wait 1 second after component mount

    return () => clearTimeout(timer);
  }, []);

  const { data } = useQuery({
    queryKey: ["order-period"],
    queryFn: async () => {
      try {
        // Check if user is authenticated before making API call
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.warn("OrderWindowContext: No user found, defaulting to canOrder: false");
          return { canOrder: false };
        }

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.token) {
          console.warn("OrderWindowContext: No token found, defaulting to canOrder: false");
          return { canOrder: false };
        }

        console.log("OrderWindowContext: Making API call to check order window status");
        const result = await orderWindowApi.getStatus();
        console.log("OrderWindowContext: API call successful:", result);
        
        // Return enhanced order window information
        return {
          canOrder: result?.canOrder ?? result?.open ?? false,
          reason: result?.reason || 'unknown',
          isNaturalPeriod: result?.isNaturalPeriod ?? false,
          isAdminOverride: result?.isAdminOverride ?? false,
          secondsRemaining: result?.secondsRemaining ?? 0,
          message: result?.message || 'Status unknown'
        };
      } catch (error) {
        console.warn("OrderWindowContext: Order period check failed:", error);
        console.warn("OrderWindowContext: Error status:", error.response?.status);
        
        // Don't retry on 401 errors to avoid triggering logout
        if (error.response?.status === 401) {
          console.warn("OrderWindowContext: 401 error, defaulting to canOrder: false");
          return { 
            canOrder: false, 
            reason: 'auth_error',
            isNaturalPeriod: false,
            isAdminOverride: false,
            secondsRemaining: 0,
            message: 'Authentication error'
          };
        }
        
        return { 
          canOrder: false, 
          reason: 'error',
          isNaturalPeriod: false,
          isAdminOverride: false,
          secondsRemaining: 0,
          message: 'Failed to check order window status'
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: (failureCount, error) => {
      // Don't retry on 401 errors to avoid triggering logout
      if (error.response?.status === 401) {
        return false;
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    retryDelay: 2000, // Fixed 2 second delay
    // Only enable query if user is authenticated AND component is ready
    enabled: isReady && (!!auth?.user || !!localStorage.getItem('user')),
  });

  return (
    <OrderWindowCtx.Provider value={{ 
      canOrder: !!data?.canOrder,
      reason: data?.reason || 'unknown',
      isNaturalPeriod: data?.isNaturalPeriod ?? false,
      isAdminOverride: data?.isAdminOverride ?? false,
      secondsRemaining: data?.secondsRemaining ?? 0,
      message: data?.message || 'Status unknown'
    }}>
      {children}
    </OrderWindowCtx.Provider>
  );
}

export function useOrderWindow() {
  return useContext(OrderWindowCtx);
}