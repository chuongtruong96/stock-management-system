import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { WsContext } from "context/WsContext";
import { orderApi, productApi, orderWindowApi } from "services/api"; // Updated import

export default function useAdminData() {
  const [orders, setOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [products, setProducts] = useState([]);
  const [winOpen, setWinOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subscribe } = useContext(WsContext);

  /* ---------------- fetch all ---------------- */
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [
        ordersRes,
        pendingRes,
        monthlyRes,
        productsRes,
        winRes,
      ] = await Promise.all([
        orderApi.all(), // Updated to orderApi.all
        orderApi.getPendingCount(), // Updated to orderApi.getPendingCount
        orderApi.getMonthlyCount(), // Updated to orderApi.getMonthlyCount
        productApi.all(), // Updated to productApi.all
        orderWindowApi.getStatus(), // Updated to orderWindowApi.getStatus
      ]);

      setOrders(ordersRes);
      setPendingCount(pendingRes.count);
      setMonthlyOrders(monthlyRes);
      setProducts(productsRes);
      setWinOpen(winRes.open);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- sockets ------------------ */
  const handleAdminOrders = useCallback((o) => {
    setOrders((prev) => [o, ...prev]);
    if (o.status === "pending") setPendingCount((c) => c + 1);
  }, []);

  useEffect(() => {
    fetchAll();
    const unsubs = [];
    subscribe("/topic/orders/admin", handleAdminOrders).then((off) =>
      unsubs.push(off)
    );
    subscribe("/topic/order-window", ({ open }) => setWinOpen(open)).then(
      (off) => unsubs.push(off)
    );
    return () => unsubs.forEach((off) => off());
  }, [subscribe, handleAdminOrders, fetchAll]);

  /* ---------------- derived ------------------ */
  const pendingList = useMemo(() => orders.filter(o => o.status === "pending"), [orders]);
  const avgPendingAge = useMemo(() => {
    if (!pendingList.length) return 0;
    const sumDays = pendingList.reduce(
      (s,o) => s + (Date.now() - new Date(o.createdAt)) / 86_400_000,
      0
    );
    return Math.round(sumDays / pendingList.length);
  }, [pendingList]);

  return {
    orders,
    pendingCount,
    monthlyOrders,
    products,
    winOpen,
    loading,
    error,
    avgPendingAge,
    fetchAll,
    setWinOpen,
  };
}