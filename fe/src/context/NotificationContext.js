// src/context/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "context/AuthContext";
import { useBackendStatus } from "./BackendStatusContext";

import { notificationApi } from "../services/api"; // Updated import

const Ctx = createContext(null);
export const useNotifications = () => useContext(Ctx);

export function NotificationProvider({ children }) {
  /* ---------- state ---------- */
  const [items, setItems] = useState([]);
  const { auth } = useContext(AuthContext);
  const { isBackendAvailable } = useBackendStatus();

  /* ---------- 1. Lấy lần đầu ---------- */
  useEffect(() => {
    if (auth.token && isBackendAvailable) {
      notificationApi.fetch() // Updated to notificationApi.fetch, removed .data
        .then((r) => setItems(r))
        .catch(console.error);
    } else {
      // khi logout hoặc backend không available, xóa hết notification cũ
      setItems([]);
    }
  }, [auth.token, isBackendAvailable]);

  /* ---------- 2. Kết nối STOMP ---------- */
  useEffect(() => {
    if (!isBackendAvailable) {
      console.log("[NOTIFY‑WS] Backend not available, skipping WebSocket connection");
      return;
    }
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user?.token;
    if (!token) {
      console.log("[NOTIFY‑WS] No token found, skipping WebSocket connection");
      return; // chưa login
    }

    console.log("[NOTIFY‑WS] Connecting with token:", token ? "present" : "missing");

    // Determine WebSocket URL based on environment
    const getWebSocketUrl = () => {
      // In development, use the backend port
      if (process.env.NODE_ENV === 'development' && window?.location?.port === '3000') {
        return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8082/ws`;
      }
      // In production, use relative URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}/ws`;
    };
    
    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000, // Reduced delay for faster reconnection
      maxReconnectAttempts: 10, // Increased attempts
      connectHeaders: { 
        Authorization: `Bearer ${token}`,
        'Access-Control-Allow-Origin': '*'
      },
      debug: (m) => {
        if (process.env.NODE_ENV === 'development') {
          console.log("[NOTIFY‑WS]", m);
        }
      },
      onConnect: (frame) => {
        console.log("[NOTIFY‑WS] Connected successfully", frame);
        // ① notification riêng
        try {
          const userSub = client.subscribe("/user/queue/notifications", (msg) => {
            console.log("[NOTIFY‑WS] Received user notification:", msg.body);
            setItems((prev) => [JSON.parse(msg.body), ...prev]);
          });
          console.log("[NOTIFY‑WS] Subscribed to user notifications");
          
          // ② notification global (nếu có)
          const globalSub = client.subscribe("/topic/notifications/global", (msg) => {
            console.log("[NOTIFY‑WS] Received global notification:", msg.body);
            setItems((prev) => [JSON.parse(msg.body), ...prev]);
          });
          console.log("[NOTIFY‑WS] Subscribed to global notifications");
        } catch (error) {
          console.error("[NOTIFY‑WS] Subscription error:", error);
        }
      },
      onDisconnect: (frame) => {
        console.log("[NOTIFY‑WS] Disconnected", frame);
      },
      onStompError: (frame) => {
        console.error("[NOTIFY‑WS] STOMP Error:", frame);
        console.error("[NOTIFY‑WS] Error details:", frame.headers, frame.body);
      },
      onWebSocketError: (error) => {
        console.error("[NOTIFY‑WS] WebSocket Error:", error);
      },
      onWebSocketClose: (event) => {
        console.log("[NOTIFY‑WS] WebSocket closed:", event.code, event.reason);
      },
    });

    client.activate();
    return () => {
      console.log("[NOTIFY‑WS] Deactivating client");
      client.deactivate();
    };
  }, [auth.token, isBackendAvailable]);

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