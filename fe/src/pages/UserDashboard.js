import { useState, useEffect, useContext, useCallback } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { getLatestOrder, getWindowStatus } from "../services/api"; // bỏ checkOrderPeriod
import { WsContext } from "../contexts/WsContext";
import { toast } from "react-toastify";
import "../assets/styles/custom.css";

const UserDashboard = ({ language }) => {
  const [latestOrder, setLatestOrder] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0); // -1  =  “vô thời hạn”
  const [winOpen, setWinOpen] = useState(true);
  const { subscribe } = useContext(WsContext);

  /* ---------- helper ---------- */
  const computeDays = useCallback((openFlag) => {
    const today = new Date().getDate();
    const inFirstWeek = today <= 7;

    if (!openFlag && !inFirstWeek) {
      // đóng hoàn toàn
      setDaysRemaining(0);
      return;
    }
    if (inFirstWeek) {
      setDaysRemaining(7 - today); // số ngày còn lại của tuần đầu
    } else {
      setDaysRemaining(-1); // vô thời hạn (admin mở KHẨN)
    }
  }, []);

  /* ---------- first load + realtime ---------- */
  useEffect(() => {
    (async () => {
      try {
        const [orderRes, winRes] = await Promise.all([
          getLatestOrder(),
          getWindowStatus(),
        ]);
        setLatestOrder(orderRes.data);
        setWinOpen(winRes.data.open);
        computeDays(winRes.data.open);
      } catch (e) {
        console.error(e);
      }
    })();

    const unsubs = [];
    // Subscribe to order updates for this dept
    subscribe(`/topic/orders/${latestOrder?.departmentId ?? 0}`, (o) => {
      setLatestOrder(o);
      toast.info(
        language === "vi"
          ? `Đơn #${o.orderId} đã ${o.status}`
          : `Order #${o.orderId} ${o.status}`
      );
    }).then((off) => unsubs.push(off));
    // Subscribe to window‑open events
    subscribe("/topic/order-window", ({ open }) => {
      setWinOpen(open);
      computeDays(open);
    }).then((off) => unsubs.push(off));

    return () => unsubs.forEach((off) => off());
  }, [language, subscribe, computeDays]);

  /* ---------- helpers để hiển thị ---------- */
  const windowReallyOpen = winOpen || daysRemaining > 0 || daysRemaining === -1;
  const message = () => {
    if (!windowReallyOpen) {
      return language === "vi"
        ? "Đã đóng cửa sổ đặt hàng."
        : "Ordering window is closed.";
    }
    if (daysRemaining === -1) {
      return language === "vi"
        ? "Cửa sổ đang mở do quản trị viên."
        : "Ordering window is OPEN by admin.";
    }
    return language === "vi"
      ? `Còn ${daysRemaining} ngày để đặt.`
      : `${daysRemaining} day(s) left for ordering.`;
  };

  /* ---------- UI ---------- */
  return (
    <Box sx={{ pt: 8, p: 3 }} className="fade-in-up">
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Bảng Điều Khiển Người Dùng" : "User Dashboard"}
      </Typography>

      {/* ---- Latest order ---- */}
      <Card className="mui-card" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            {language === "vi" ? "Đơn Gần Nhất" : "Latest Order"}
          </Typography>

          {latestOrder ? (
            <>
              <Typography>
                ID: {latestOrder.orderId} —{" "}
                {new Date(latestOrder.createdAt).toLocaleString()}
              </Typography>
              <Typography>
                {language === "vi" ? "Trạng Thái" : "Status"}:{" "}
                {latestOrder.status}
              </Typography>
              {latestOrder.adminComment && (
                <Typography>
                  {language === "vi" ? "Ghi Chú" : "Admin Comment"}:{" "}
                  {latestOrder.adminComment}
                </Typography>
              )}
            </>
          ) : (
            <Typography>
              {language === "vi" ? "Chưa có đơn." : "No order yet."}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ---- Order window ---- */}
      <Card className="mui-card">
        <CardContent>
          <Typography variant="h6">
            {language === "vi" ? "Cửa Sổ Đặt Hàng" : "Order Window"}
          </Typography>
          <Typography color={windowReallyOpen ? "success.main" : "error"}>
            {message()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDashboard;
