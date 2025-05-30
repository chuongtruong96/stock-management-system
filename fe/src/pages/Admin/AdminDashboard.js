// src/pages/Admin/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Card,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import useAdminData from "hooks/useAdminData";
import { summaryApi, orderWindowApi, orderApi } from "services/api";
import { useContext } from "react";
import { AuthContext } from "context/AuthContext";

import RejectDialog from "components/dialogs/RejectDialog";
import DashboardShell from "layouts/DashboardShell";

export default function AdminDashboard() {
  const { t } = useTranslation();

  const {
    orders,
    pendingCount,
    monthlyOrders,
    products,
    winOpen,
    loading,
    error,
    avgPendingAge,
    fetchAll,
    setWinOpen,
  } = useAdminData();

  const [rejectingId, setRejectingId] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
      summaryApi.topProducts(5).then((response) => setTopProducts(response));
      orderApi.checkPeriod().catch((err) => {
        console.error("Failed to check period:", err);
        // Handle error without redirecting (already handled by interceptor)
      });
  }, []);

  /* ---------- charts data ---------- */
  const topProductsChart = useMemo(
    () => ({
      labels: topProducts.map((p) => p.productName),
      datasets: [
        {
          label: t("orderedQty"),
          data: topProducts.map((p) => p.totalQuantity),
          color: "info",
        },
      ],
    }),
    [topProducts, t]
  );

  /* ---------- summary cards ---------- */
  const summaryCards = [
    {
      color: "dark",
      icon: "hourglass_top",
      title: t("pendingOrders"),
      count: pendingCount || "—",
      route: pendingCount ? "/order-management" : null,
      percentage: { color:"secondary", amount:`${avgPendingAge} d`, label:t("avgAge") },
    },
    { icon:"leaderboard", title:t("ordersThisMonth"), count:monthlyOrders },
    { color:"success", icon:"store", title:t("totalProducts"), count:products.length },
    { color:"primary", icon:"inventory_2", title:t("totalOrders"), count:orders.length },
  ];

  /* ---------- table columns ---------- */
  const tableColumns = useMemo(
    () => [
      { Header: t("id"), accessor: "orderId" },
      {
        Header: t("date"),
        accessor: "createdAt",
        Cell: ({ value }) => (value ? new Date(value).toLocaleString() : ""),
      },
      { Header: t("status"), accessor: "status" },
      { Header: t("comment"), accessor: "adminComment" },
    ],
    [t]
  );

  if (loading)
    return (
      <DashboardShell title={t("adminDashboard")}>
        <MDBox display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </MDBox>
      </DashboardShell>
    );

  if (error)
    return (
      <DashboardShell title={t("adminDashboard")}>
        <MDTypography variant="h5" color="error">{error}</MDTypography>
      </DashboardShell>
    );

  return (
    <DashboardShell title={t("adminDashboard")}>
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 2, textAlign: "center", borderRadius: 2, boxShadow: 3 }}>
            <MDButton
              fullWidth
              size="large"
              color={winOpen ? "success" : "error"}
              onClick={async () => {
                const response = await orderWindowApi.toggle();
                setWinOpen(response.open);
              }}
            >
              {t("orderWindow")}{" "}
              <MDTypography variant="button" color="white">
                {winOpen ? t("open") : t("closed")}
              </MDTypography>
            </MDButton>
          </Card>
        </Grid>
      </Grid>

      {/* ===== SUMMARY CARDS ===== */}
      <Grid container columnSpacing={3} rowSpacing={5} justifyContent="space-between">
        {summaryCards.map((cfg) => {
          const body = (
            <MDBox mb={1.5}>
              <ComplexStatisticsCard {...cfg} />
            </MDBox>
          );
          return (
            <Grid key={cfg.title} item xs={12} sm={6} md={4} lg={4} sx={{ flexGrow: 1 }}>
              {cfg.route ? (
                <Link to={cfg.route} style={{ textDecoration: "none" }}>{body}</Link>
              ) : body}
            </Grid>
          );
        })}
      </Grid>

      {/* ===== RECENT ORDERS ===== */}
      <MDBox mt={4}>
        <MDTypography variant="h5" gutterBottom>{t("recentOrders")}</MDTypography>
        <DataTable
          table={{ columns: tableColumns, rows: orders }}
          canSearch={false}
          entriesPerPage={{ defaultValue: 5, entries: [5, 10, 15] }}
        />
      </MDBox>

      {/* ===== CHARTS ===== */}
      <MDBox p={2} sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Card sx={{ flex: 1, minWidth: 300, maxWidth: "48%", borderRadius: 2, boxShadow: 3 }}>
          <MDBox p={2}>
            <HorizontalBarChart
              icon={{ color: "info", component: "inventory" }}
              title={t("topOrderedProducts")}
              description=""
              chart={topProductsChart}
            />
            <MDBox mt={1} display="flex" alignItems="center">
              <MDButton
                variant="text"
                color="primary"
                size="small"
                onClick={() => {
                  fetchAll();
                  summaryApi.topProducts(5).then((response) => setTopProducts(response));
                  toast.success(t("refreshed"));
                }}
              >
                {t("refresh")}
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>

      {/* ----- Reject dialog ----- */}
      <RejectDialog
        open={Boolean(rejectingId)}
        onClose={() => setRejectingId(null)}
        onConfirm={async (reason) => {
          await orderApi.reject(rejectingId, reason);
          toast.success(t("orderRejected"));
          fetchAll();
        }}
      />
    </DashboardShell>
  );
}