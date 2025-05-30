// src/hooks/useOrderHistory.js
import { useQuery } from "@tanstack/react-query";
import { qk } from "../api/queries";
import { myOrders } from "../services/api";

export const useOrderHistory = (page = 0) =>
  useQuery({ queryKey: [...qk.orderHist, page], queryFn: () => myOrders(page) });