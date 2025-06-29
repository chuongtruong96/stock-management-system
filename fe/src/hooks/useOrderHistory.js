// src/hooks/useOrderHistory.js
import { useQuery } from "@tanstack/react-query";
import { qk } from "../api/queries";
import { orderApi } from "../services/api"; // ✅ Corrected

export const useOrderHistory = (page = 0) =>
  useQuery({ 
    queryKey: [...qk.orderHist, page], 
    queryFn: () => orderApi.track(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
