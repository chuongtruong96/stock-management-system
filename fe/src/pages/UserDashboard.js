// src/pages/UserDashboard.jsx
import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { getLatestOrder, checkOrderPeriod } from "../services/api";
import "../assets/styles/custom.css";

const UserDashboard = ({ language }) => {
  const [latestOrder, setLatestOrder] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [orderRes, periodRes] = await Promise.all([
          getLatestOrder(),
          checkOrderPeriod(),
        ]);
        setLatestOrder(orderRes.data);
        if (periodRes.data.canOrder) {
          const today = new Date().getDate();
          const daysLeft = 31 - today;
          setDaysRemaining(daysLeft > 0 ? daysLeft : 0);
        } else {
          setDaysRemaining(0);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [language]);

  return (
    <Box sx={{ pt: 8, p: 3 }} className="fade-in-up">
      <Typography variant="h4" gutterBottom>
        {language === "vi"
          ? "Bảng Điều Khiển Người Dùng"
          : "User Dashboard"}
      </Typography>
      <Card className="mui-card" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">
            {language === "vi" ? "Đơn Hàng Gần Nhất" : "Latest Order"}
          </Typography>
          {latestOrder ? (
            <>
              <Typography>
                {language === "vi" ? "Mã Đơn Hàng" : "Order ID"}:{" "}
                {latestOrder.orderId}
              </Typography>
              <Typography>
                {language === "vi" ? "Ngày Tạo" : "Date"}:{" "}
                {latestOrder.createdAt}
              </Typography>
              <Typography>
                {language === "vi" ? "Trạng Thái" : "Status"}:{" "}
                {latestOrder.status}
              </Typography>
              {latestOrder.adminComment && (
                <Typography>
                  {language === "vi" ? "Bình Luận Quản Trị" : "Admin Comment"}:{" "}
                  {latestOrder.adminComment}
                </Typography>
              )}
            </>
          ) : (
            <Typography>
              {language === "vi" ? "Chưa có đơn hàng nào." : "No orders yet."}
            </Typography>
          )}
        </CardContent>
      </Card>
      <Card className="mui-card">
        <CardContent>
          <Typography variant="h6">
            {language === "vi" ? "Thời Gian Đặt Hàng" : "Order Period"}
          </Typography>
          {daysRemaining > 0 ? (
            <Typography>
              {language === "vi"
                ? `Bạn còn ${daysRemaining} ngày để đặt hàng.`
                : `You have ${daysRemaining} day(s) left to place an order.`}
            </Typography>
          ) : (
            <Typography>
              {language === "vi"
                ? "Thời gian đặt hàng đã đóng."
                : "Ordering is closed for this month."}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDashboard;
