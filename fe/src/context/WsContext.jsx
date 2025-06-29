// src/context/WsContext.jsx
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import { useBackendStatus } from "./BackendStatusContext";

/* ---------------- CONSTANTS ---------------- */
export const WsContext = createContext(null);

// Determine WebSocket URL based on environment
const getWebSocketUrl = () => {
  // In development, use the backend port
  if (process.env.NODE_ENV === 'development' && window?.location?.port === '3000') {
    return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8080/ws`;
  }
  // In production, use relative URL
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
};

const createClient = () => {
  // Get authentication token
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user?.token;
  
  return new Client({
    webSocketFactory: () => {
      try {
        return new WebSocket(getWebSocketUrl());
      } catch (error) {
        console.error("[STOMP] WebSocket creation failed:", error);
        throw error;
      }
    },
    reconnectDelay: 10_000, // Increased delay to reduce spam
    maxReconnectAttempts: 5, // Limit reconnection attempts
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (m) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("[STOMP]", m);
      }
    },
    onConnect: () => {
      console.log("[STOMP] Connected successfully");
    },
    onDisconnect: () => {
      console.log("[STOMP] Disconnected");
    },
    onStompError: (frame) => {
      console.error("[STOMP] Error:", frame);
    },
    onWebSocketError: (error) => {
      console.error("[STOMP] WebSocket Error:", error);
    },
  });
};

let client = createClient();

/* Kết nối; trả Promise resolve khi đã connect */
export const connectStomp = () =>
  new Promise((res, rej) => {
    if (client.connected) return res();
    
    // Check if user is authenticated
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.token) {
      console.warn("[STOMP] No authentication token available");
      // Don't reject immediately - allow connection without auth for public topics
      // Some WebSocket endpoints might be public
    }
    
    // Recreate client with fresh token if available
    if (user?.token && !client.connectHeaders?.Authorization) {
      console.log("[STOMP] Recreating client with fresh token");
      client = createClient();
    }
    
    let timeout = setTimeout(() => {
      console.warn("[STOMP] Connection timeout, but continuing...");
      // Don't reject on timeout - some connections might be slow
      res(); // Resolve anyway to prevent blocking
    }, 15000); // Increased timeout
    
    client.onConnect = () => {
      console.log("[STOMP] Successfully connected");
      clearTimeout(timeout);
      res();
    };
    
    client.onStompError = (frame) => {
      console.error("[STOMP] STOMP Error:", frame);
      clearTimeout(timeout);
      // Don't reject on STOMP errors - might be recoverable
      console.warn("[STOMP] STOMP error occurred, but continuing...");
      res(); // Resolve to prevent blocking the app
    };
    
    client.onWebSocketError = (error) => {
      console.error("[STOMP] WebSocket Error:", error);
      clearTimeout(timeout);
      // Don't reject on WebSocket errors - might be recoverable
      console.warn("[STOMP] WebSocket error occurred, but continuing...");
      res(); // Resolve to prevent blocking the app
    };
    
    try {
      client.activate();
    } catch (error) {
      console.error("[STOMP] Failed to activate client:", error);
      clearTimeout(timeout);
      // Don't reject on activation errors - app should continue working
      console.warn("[STOMP] Client activation failed, but continuing...");
      res(); // Resolve to prevent blocking the app
    }
  });

/* ======================================================
   Provider
   ==================================================== */
const WsProvider = ({ children }) => {
  const { isBackendAvailable } = useBackendStatus();
  
  /* ----- giữ danh sách subscription để huỷ dễ dàng ----- */
  const subs = useRef([]);

  /* ----- send: luôn ổn định nhờ useCallback ----- */
  const send = useCallback(
    (dest, body) => {
      if (!isBackendAvailable) {
        console.warn("[STOMP] Backend not available, skipping send");
        return false;
      }
      return client.connected &&
        client.publish({ destination: dest, body: JSON.stringify(body) });
    },
    [isBackendAvailable]
  );

  /* ----- subscribe: ổn định & trả hàm huỷ ----- */
  const subscribe = useCallback(async (topic, handler) => {
    if (!isBackendAvailable) {
      console.warn("[STOMP] Backend not available, skipping subscription to", topic);
      return () => {}; // Return empty function to prevent errors
    }
    
    try {
      await connectStomp();
      const sub = client.subscribe(topic, (m) => handler(JSON.parse(m.body)));
      subs.current.push(sub);
      return () => sub.unsubscribe();
    } catch (error) {
      console.error("[STOMP] Failed to subscribe to", topic, error);
      return () => {}; // Return empty function to prevent errors
    }
  }, [isBackendAvailable]);

  /* ----- dọn dẹp tất cả khi Provider unmount ----- */
  useEffect(
    () => () => subs.current.forEach((s) => s.unsubscribe()),
    []
  );

  /* ----- ví dụ: hiện toast khi admin mở/đóng window ----- */
  useEffect(() => {
    let off;                               // lưu hàm huỷ
    (async () => {
      try {
        off = await subscribe("/topic/order-window", ({ open }) =>
          toast.info(open ? "✅ Window OPEN" : "⏰ Window CLOSED")
        );
      } catch (error) {
        console.warn("[STOMP] Failed to subscribe to order-window topic:", error);
      }
    })();
    return () => off && off();
  }, [subscribe]);

  /* ----- value context, chỉ thay đổi khi send/subscribe đổi ----- */
  const ctx = useMemo(() => ({ subscribe, send }), [subscribe, send]);

  return <WsContext.Provider value={ctx}>{children}</WsContext.Provider>;
};

export default WsProvider;