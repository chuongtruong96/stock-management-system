import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../services/api";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const OrderWindowCtx = createContext({ canOrder: false });

export function OrderWindowProvider({ children }) {
  const { auth } = useContext(AuthContext); // Add AuthContext

  const { data } = useQuery({
    queryKey: ["order-period"],
    queryFn: async () => {
      try {
        const result = await orderApi.checkPeriod();
        return result || { canOrder: false };
      } catch (error) {
        console.warn("Order period check failed:", error);
        return { canOrder: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
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