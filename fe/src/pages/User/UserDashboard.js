// src/pages/User/UserDashboard.jsx
import { CircularProgress, Grid, Icon } from "@mui/material";

/* template comps */
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import TimelineItem          from "examples/Timeline/TimelineItem";
import MDBox                 from "components/MDBox";
import MDTypography          from "components/MDTypography";

/* hook */
import useUserData from "hooks/useUserData";

/* shell */
import DashboardShell from "layouts/DashboardShell";

export default function UserDashboard({ language = "en" }) {
  const {
    latestOrder,
    daysRemaining,
    windowReallyOpen,
    loading,
  } = useUserData(language);

  const msg = () => {
    if (!windowReallyOpen)
      return language==="vi"
        ? "Đã đóng cửa sổ đặt hàng."
        : "Ordering window is closed.";
    if (daysRemaining === -1)
      return language==="vi"
        ? "Cửa sổ đang mở do quản trị viên."
        : "Ordering window is OPEN by admin.";
    return language==="vi"
      ? `Còn ${daysRemaining} ngày để đặt.`
      : `${daysRemaining} day(s) left for ordering.`;
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <DashboardShell title={language==="vi" ? "Bảng Điều Khiển" : "Dashboard"}>
        <MDBox display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </MDBox>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={language==="vi" ? "Bảng Điều Khiển" : "Dashboard"}>
      <Grid container spacing={3}>
        {/* Latest order card */}
        <Grid item xs={12} md={6} lg={4}>
          <ComplexStatisticsCard
            color="info"
            icon="shopping_cart"
            title={language==="vi" ? "Đơn Gần Nhất" : "Latest Order"}
            count={latestOrder ? `#${latestOrder.orderId}` : "—"}
            percentage={{
              color: latestOrder?.status === "approved" ? "success" : "warning",
              amount: latestOrder?.status ?? "—",
              label: latestOrder
                ? new Date(latestOrder.createdAt).toLocaleString()
                : "",
            }}
          />
        </Grid>

        {/* Order window status */}
        <Grid item xs={12} md={6} lg={4}>
          <ComplexStatisticsCard
            color={windowReallyOpen ? "success" : "error"}
            icon="timer"
            title={language==="vi" ? "Cửa Sổ Đặt Hàng" : "Order Window"}
            count={msg()}
          />
        </Grid>
      </Grid>

      {/* Timeline (optional) */}
      {latestOrder && (
        <MDBox mt={4}>
          <MDTypography variant="h5" mb={2}>
            {language==="vi" ? "Hoạt động gần đây" : "Recent Activity"}
          </MDTypography>
          <TimelineItem
            color="info"
            icon={<Icon>shopping_cart</Icon>}
            title={
              language==="vi"
                ? `Đơn #${latestOrder.orderId} ${latestOrder.status}`
                : `Order #${latestOrder.orderId} ${latestOrder.status}`
            }
            dateTime={new Date(latestOrder.createdAt).toLocaleString()}
            lastItem
          />
        </MDBox>
      )}
    </DashboardShell>
  );
}
