// src/context/WsContext.jsx
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Client }   from "@stomp/stompjs";
import SockJS       from "sockjs-client";
import { toast }    from "react-toastify";

/* ---------------- CONSTANTS ---------------- */
export const WsContext = createContext(null);

const WS_URL = "http://localhost:8082/ws";

const client = new Client({
  webSocketFactory: () => new SockJS(WS_URL),
  reconnectDelay  : 5_000,                     // tự reconnect
  debug           : (m) => console.log("[STOMP]", m),
});

/* Kết nối; trả Promise resolve khi đã connect */
export const connectStomp = () =>
  new Promise((res) => {
    if (client.connected) return res();
    client.onConnect = () => res();
    client.activate();
  });

/* ======================================================
   Provider
   ==================================================== */
const WsProvider = ({ children }) => {
  /* ----- giữ danh sách subscription để huỷ dễ dàng ----- */
  const subs = useRef([]);

  /* ----- send: luôn ổn định nhờ useCallback ----- */
  const send = useCallback(
    (dest, body) =>
      client.connected &&
      client.publish({ destination: dest, body: JSON.stringify(body) }),
    []
  );

  /* ----- subscribe: ổn định & trả hàm huỷ ----- */
  const subscribe = useCallback(async (topic, handler) => {
    await connectStomp();
    const sub = client.subscribe(topic, (m) => handler(JSON.parse(m.body)));
    subs.current.push(sub);
    return () => sub.unsubscribe();
  }, []);

  /* ----- dọn dẹp tất cả khi Provider unmount ----- */
  useEffect(
    () => () => subs.current.forEach((s) => s.unsubscribe()),
    []
  );

  /* ----- ví dụ: hiện toast khi admin mở/đóng window ----- */
  useEffect(() => {
    let off;                               // lưu hàm huỷ
    (async () => {
      off = await subscribe("/topic/order-window", ({ open }) =>
        toast.info(open ? "✅ Window OPEN" : "⏰ Window CLOSED")
      );
    })();
    return () => off && off();
  }, [subscribe]);

  /* ----- value context, chỉ thay đổi khi send/subscribe đổi ----- */
  const ctx = useMemo(() => ({ subscribe, send }), [subscribe, send]);

  return <WsContext.Provider value={ctx}>{children}</WsContext.Provider>;
};

export default WsProvider;
