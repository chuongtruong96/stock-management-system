// src/pages/Admin/AdminDashboard.jsx
import { useMemo, useState } from "react";
import {
  Grid,
  Card,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

/* template comps */
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart       from "examples/Charts/BarCharts/ReportsBarChart";
import HorizontalBarChart    from "examples/Charts/BarCharts/HorizontalBarChart";
import DataTable             from "examples/Tables/DataTable";
import MDBox                 from "components/MDBox";
import MDTypography          from "components/MDTypography";
import MDButton              from "components/MDButton";

/* hooks */
import useAdminData from "hooks/useAdminData";

/* api */
import { toggleWindow, approveOrder, rejectOrder } from "services/api";

/* dialog */
import RejectDialog from "components/dialogs/RejectDialog";

/* shell */
import DashboardShell from "layouts/DashboardShell";
import { Today } from "@mui/icons-material";

export default function AdminDashboard() {
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

  /* ---------- charts data ---------- */
  const inStockChart = useMemo(
    () => ({
      labels: products.slice(0, 5).map((p) => p.name),
      datasets: [
        {
          label: "Stock",
          data: products.slice(0, 5).map((p) => p.stock),
          color: "info",
        },
      ],
    }),
    [products]
  );

  const orderedChart = useMemo(
    () => ({
      labels  : products.map((p) => p.name),
      datasets: {
        label: "Orders",
        data : products.map((p) => p.stock),
      },
    }),
    [products]
  );

  /* ---------- summary cards ---------- */
  const summaryCards = [
    {
      color: "dark",
      icon : "hourglass_top",
      title: "Pending Orders",
      count: pendingCount || "—",
      route: pendingCount ? "/order-management" : null,
      percentage: { color:"secondary", amount:`${avgPendingAge} d`, label:"avg. age" },
    },
    { icon:"leaderboard", title:"Orders (This Month)", count:monthlyOrders },
    { color:"success", icon:"store", title:"Total Products", count:products.length },
    { color:"primary", icon:"inventory_2", title:"Total Orders", count:orders.length },
  ];

  /* ---------- table columns ---------- */
  const tableColumns = useMemo(() => [
    { Header:"ID", accessor:"orderId" },
    {
      Header:"Date",
      accessor:"createdAt",
      Cell:({ value })=> value ? new Date(value).toLocaleString() : "",
    },
    { Header:"Status",  accessor:"status" },
    { Header:"Comment", accessor:"adminComment" },
    {
      Header:"Actions",
      accessor:"action",
      Cell:({ row }) =>
        row.original.status === "pending" && (
          <>
            <MDButton
              size="small"
              variant="contained"
              color="success"
              sx={{ mr:1 }}
              onClick={() => approveOrder(row.original.orderId).then(fetchAll)}
            >
              Approve
            </MDButton>
            <MDButton
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setRejectingId(row.original.orderId)}
            >
              Reject
            </MDButton>
          </>
        ),
    },
  ], [fetchAll]);

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <DashboardShell title="Admin Dashboard">
        <MDBox display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </MDBox>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell title="Admin Dashboard">
        <MDTypography variant="h5" color="error">
          {error}
        </MDTypography>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Admin Dashboard">
      {/* ===== ORDER WINDOW TOGGLE ===== */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2, textAlign:"center", borderRadius:2, boxShadow:3 }}>
            <MDButton
              fullWidth
              size="large"
              color={winOpen ? "success" : "error"}
              onClick={async () => {
                const res = await toggleWindow();
                setWinOpen(res.data.open);
              }}
            >
              ORDER WINDOW&nbsp;
              <MDTypography variant="button" color="white">
                {winOpen ? "Open" : "Closed"}
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
            <Grid key={cfg.title} item xs={12} sm={6} md={4} lg={4} sx={{ flexGrow:1 }}>
              {cfg.route ? (
                <Link to={cfg.route} style={{ textDecoration:"none" }}>{body}</Link>
              ) : body}
            </Grid>
          );
        })}
      </Grid>

      {/* ===== RECENT ORDERS ===== */}
      <MDBox mt={4}>
        <MDTypography variant="h5" gutterBottom>
          Recent Orders
        </MDTypography>
        <DataTable
          table={{ columns: tableColumns, rows: orders }}
          canSearch={false}
          entriesPerPage={{ defaultValue:10, entries:[10,25,50] }}
        />
      </MDBox>

      {/* ===== CHARTS ===== */}
      <MDBox
        p={2}
        sx={{ display:"flex", gap:3, flexWrap:"wrap" }}
      >
        <Card sx={{ flex:1, minWidth:300, maxWidth:"48%", borderRadius:2, boxShadow:3 }}>
          <MDBox p={2}>
            <HorizontalBarChart
              icon={{ color:"info", component:"inventory" }}
              title="Top 5 – In stock"
              description=""
              chart={inStockChart}
            />
          </MDBox>
        </Card>

        <Card sx={{ flex:1, minWidth:300, maxWidth:"48%", borderRadius:2, boxShadow:3 }}>
          <MDBox p={2}>
            <ReportsBarChart
              color="info"
              title="Top Ordered Products"
              
     description=""        /* tránh children warning */
              chart={orderedChart}
            />
            <MDBox mt={1} display="flex" alignItems="center">
              <MDButton
                variant="text"
                color="primary"
                size="small"
                onClick={() => {
                  fetchAll();
                  toast.success("Data refreshed");
                }}
              >
                refresh
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
          await rejectOrder(rejectingId, reason);
          toast.success("Order rejected");
          fetchAll();
        }}
      />
    </DashboardShell>
  );
}
