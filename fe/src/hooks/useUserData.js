// src/hooks/useUserData.js
import { useState, useEffect, useCallback, useContext } from "react";
import { WsContext }  from "context/WsContext";
import { getLatestOrder, getWindowStatus } from "services/api";

export default function useUserData(language = "en") {
  /* ------------ state ------------ */
  const [latestOrder,   setLatestOrder]   = useState(null);
  const [deptId,        setDeptId]        = useState(null);   // tách riêng
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [winOpen,       setWinOpen]       = useState(true);
  const [loading,       setLoading]       = useState(true);

  const { subscribe } = useContext(WsContext);

  /* ------------ helpers ------------ */
  const computeDays = useCallback((openFlag) => {
    const today  = new Date().getDate();
    const firstWeek = today <= 7;

    if (!openFlag && !firstWeek)      return setDaysRemaining(0);  // đóng & quá tuần 1
    if (firstWeek)                    return setDaysRemaining(7 - today);
    /* openFlag === true  hoặc admin‑mở sau tuần 1 */
    return setDaysRemaining(-1);      // -1 = “OPEN by admin”
  }, []);

  /* =========================================================
     1.  Lấy dữ liệu lần đầu (API) rồi set state
     ======================================================= */
  useEffect(() => {
    (async () => {
      try {
        const [orderRes, winRes] = await Promise.all([
          getLatestOrder(),
          getWindowStatus(),
        ]);

        const order = orderRes.data;
        setLatestOrder(order);
        setDeptId(order?.departmentId);    // để subscribe realtime
        setWinOpen(winRes.data.open);
        computeDays(winRes.data.open);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [computeDays]);

  /* =========================================================
     2.  Subscribe realtime **đúng 1 lần** cho mỗi topic
     ======================================================= */

  /* --- a. Đơn hàng của phòng ban --- */
  useEffect(() => {
    if (!deptId) return;                     // chưa biết dept → chờ
    let off;                                // hàm huỷ
    (async () => {
      off = await subscribe(`/topic/orders/${deptId}`, (o) => {
        setLatestOrder(o);
      });
    })();
    return () => off && off();              // cleanup khi unmount / deptId đổi
  }, [deptId, subscribe]);

  /* --- b. Trạng thái order‑window (chỉ 1 lần) --- */
  useEffect(() => {
    let off;
    (async () => {
      off = await subscribe("/topic/order-window", ({ open }) => {
        setWinOpen(open);
        computeDays(open);
      });
    })();
    return () => off && off();
  }, [subscribe, computeDays]);

  /* ------------ derived ------------ */
  const windowReallyOpen =
    winOpen || daysRemaining > 0 || daysRemaining === -1;

  return { latestOrder, daysRemaining, windowReallyOpen, loading };
}
