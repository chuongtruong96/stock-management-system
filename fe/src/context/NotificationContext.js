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

import { notificationApi } from "../services/api";

const Ctx = createContext(null);
export const useNotifications = () => useContext(Ctx);

export function NotificationProvider({ children }) {
  /* ---------- state ---------- */
  const [items, setItems] = useState([]);
  const { auth } = useContext(AuthContext);
  const { isBackendAvailable } = useBackendStatus();

  /* ---------- 1. Fetch initial notifications ---------- */
  useEffect(() => {
    if (auth.token) {
      console.log("[NOTIFY] Fetching notifications...");
      notificationApi.fetch()
        .then((r) => {
          console.log("[NOTIFY] Fetched notifications:", r);
          setItems(Array.isArray(r) ? r : []);
        })
        .catch((error) => {
          console.error("[NOTIFY] Failed to fetch notifications:", error);
          // Don't clear items on fetch error, keep existing ones
          // Only clear if it's an auth error
          if (error.response?.status === 401) {
            setItems([]);
          }
        });
    } else {
      // when logout, clear all notifications
      console.log("[NOTIFY] No auth token, clearing notifications");
      setItems([]);
    }
  }, [auth.token]);

  /* ---------- 2. WebSocket Connection ---------- */
  useEffect(() => {
    // Only connect if we have a token and backend is available
    if (!auth.token || !isBackendAvailable) {
      console.log("[NOTIFY‑WS] Skipping WebSocket connection - token:", !!auth.token, "backend:", isBackendAvailable);
      return;
    }

    console.log("[NOTIFY‑WS] Connecting with token:", auth.token ? "present" : "missing");

    // Determine WebSocket URL based on environment
    const getWebSocketUrl = () => {
      // In development, use the backend port
      if (process.env.NODE_ENV === 'development' && window?.location?.port === '3000') {
        return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8080/ws`;
      }
      // In production, use relative URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}/ws`;
    };
    
    const client = new Client({
      brokerURL: getWebSocketUrl(),
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      connectHeaders: { 
        Authorization: `Bearer ${auth.token}`,
        'Access-Control-Allow-Origin': '*'
      },
      debug: (m) => {
        if (process.env.NODE_ENV === 'development') {
          console.log("[NOTIFY‑WS]", m);
        }
      },
      onConnect: (frame) => {
        console.log("[NOTIFY‑WS] Connected successfully", frame);
        try {
          // Subscribe to user-specific notifications
          const userSub = client.subscribe("/user/queue/notifications", (msg) => {
            console.log("[NOTIFY‑WS] Received user notification:", msg.body);
            try {
              const notification = JSON.parse(msg.body);
              setItems((prev) => [notification, ...prev]);
            } catch (parseError) {
              console.error("[NOTIFY‑WS] Failed to parse notification:", parseError);
            }
          });
          console.log("[NOTIFY‑WS] Subscribed to user notifications");
          
          // Subscribe to global notifications
          const globalSub = client.subscribe("/topic/notifications/global", (msg) => {
            console.log("[NOTIFY‑WS] Received global notification:", msg.body);
            try {
              const notification = JSON.parse(msg.body);
              setItems((prev) => [notification, ...prev]);
            } catch (parseError) {
              console.error("[NOTIFY‑WS] Failed to parse global notification:", parseError);
            }
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

  /* ---------- 3. Helper functions ---------- */
  const markAsRead = useCallback((id) => {
    console.log("[NOTIFY] Marking notification as read:", id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true, readAt: new Date().toISOString() } : i))
    );
    notificationApi.markRead(id).catch((error) => {
      console.error("[NOTIFY] Failed to mark as read:", error);
      // Revert the optimistic update on error
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, read: false, readAt: null } : i))
      );
    });
  }, []);

  const markAll = useCallback(() => {
    console.log("[NOTIFY] Marking all notifications as read");
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: now })));
    
    // Call API to mark all as read if available
    if (notificationApi.markAllRead) {
      notificationApi.markAllRead().catch((error) => {
        console.error("[NOTIFY] Failed to mark all as read:", error);
      });
    }
  }, []);

  /* ---------- context value ---------- */
  return (
    <Ctx.Provider value={{ items, markAsRead, markAll }}>
      {children}
    </Ctx.Provider>
  );
}