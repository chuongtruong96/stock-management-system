// src/context/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthContext } from "context/AuthContext";

import { notificationApi } from "../services/api"; // Updated import

const Ctx = createContext(null);
export const useNotifications = () => useContext(Ctx);

export function NotificationProvider({ children }) {
  /* ---------- state ---------- */
  const [items, setItems] = useState([]);
  const { auth } = useContext(AuthContext);

  /* ---------- 1. Lấy lần đầu ---------- */
  useEffect(() => {
    if (auth.token) {
      notificationApi.fetch() // Updated to notificationApi.fetch, removed .data
        .then((r) => setItems(r))
        .catch(console.error);
    } else {
      // khi logout, xóa hết notification cũ
      setItems([]);
    }
  }, [auth.token]);

  /* ---------- 2. Kết nối STOMP ---------- */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) return; // chưa login

    const sock = () => new SockJS("http://localhost:8082/ws");
    const client = new Client({
      webSocketFactory: sock,
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` }, // gửi JWT để backend lấy Principal
      debug: (m) => console.log("[NOTIFY‑WS]", m),
    });

    client.onConnect = () => {
      // ① notification riêng
      client.subscribe("/user/queue/notifications", (msg) => {
        setItems((prev) => [JSON.parse(msg.body), ...prev]);
      });
      // ② notification global (nếu có)
      client.subscribe("/topic/notifications/global", (msg) => {
        setItems((prev) => [JSON.parse(msg.body), ...prev]);
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  /* ---------- 3. Helpers ---------- */
  const markAsRead = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
    notificationApi.markRead(id).catch(console.error); // Updated to notificationApi.markRead
  }, []);
  const markAll = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  /* ---------- ctx ---------- */
  return (
    <Ctx.Provider value={{ items, markAsRead, markAll }}>
      {children}
    </Ctx.Provider>
  );
}