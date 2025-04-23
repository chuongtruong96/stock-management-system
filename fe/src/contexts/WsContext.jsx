import React, { createContext, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS     from "sockjs-client";
import { toast }  from "react-toastify";

export const WsContext = createContext();

const WS_URL = "http://localhost:8082/ws";
const client = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  reconnectDelay: 5000,
  debug: msg => console.log("[STOMP]", msg),
});

export const connectStomp = () =>
  new Promise(res => {
    if (client.connected) return res();
    client.onConnect = () => res();
    client.activate();
  });

const WsProvider = ({ children }) => {
  const subs = useRef([]);
  useEffect(() => () => subs.current.forEach(s => s.unsubscribe()), []);

  const subscribe = async (topic, handler) => {
    await connectStomp();
    const sub = client.subscribe(topic, msg => handler(JSON.parse(msg.body)));
    subs.current.push(sub);
    return () => sub.unsubscribe();
  };

  // Ví dụ toast
  useEffect(() => {
    subscribe("/topic/order-window", ({ open }) => toast.info(
      open ? "✅ Window OPEN" : "⏰ Window CLOSED"
    ));
  }, []);

  const send = (dest, body) =>
    client.connected && client.publish({ destination: dest, body: JSON.stringify(body) });

  return (
    <WsContext.Provider value={{ subscribe, send }}>
      {children}
    </WsContext.Provider>
  );
};

export default WsProvider;
