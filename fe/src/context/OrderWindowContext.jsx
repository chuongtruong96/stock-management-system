import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderWindowApi } from "../services/api";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const OrderWindowCtx = createContext({ canOrder: false });

export function OrderWindowProvider({ children }) {
  const { auth } = useContext(AuthContext); // Add AuthContext

  const { data } = useQuery({
    queryKey: ["order-period"],
    queryFn: () => orderWindowApi.getStatus(), // Updated to orderWindowApi.getStatus
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!auth?.token, // Only run query if authenticated
    retry: false, // Prevent retry on 401
  });

  return (
    <OrderWindowCtx.Provider value={{ canOrder: !!data?.canOrder }}>
      {children}
    </OrderWindowCtx.Provider>
  );
}

export function useOrderWindow() {
  return useContext(OrderWindowCtx);
}