// src/hooks/useOrderHistory.js
import { useQuery } from "@tanstack/react-query";
import { qk } from "../api/queries";
import { orderApi } from "../services/api"; // ✅ Corrected

export const useOrderHistory = (page = 0) =>
  useQuery({ queryKey: [...qk.orderHist, page], queryFn: () => orderApi.myOrders(page) });
