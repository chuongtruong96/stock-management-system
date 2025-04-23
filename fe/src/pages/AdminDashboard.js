import { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getPendingOrdersCount,
  getMonthlyOrdersCount,
  getLowStockProducts,
  getOrders,
  approveOrder,
  rejectOrder,
  getProducts,
  getWindowStatus,
  toggleWindow,
} from "../services/api";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { WsContext } from "../contexts/WsContext";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const MOCK_TOP_ORDERED = [
  { productName: "Bút Bi Thiên Long", total: 120 },
  // … (giữ nguyên)
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8E44AD"];

const AdminDashboard = ({ language }) => {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [orders, setOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [topRange, setTopRange] = useState(10);
  const [winOpen, setWinOpen] = useState(false);
  const [error, setError] = useState(null);
  const { subscribe } = useContext(WsContext);

  const handleStock = useCallback((p) => {
    setLowStockProducts((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.productId);
      if (p.stock >= 5 && idx > -1)
        return prev.filter((x) => x.productId !== p.productId);
      if (p.stock < 5 && idx === -1) return [...prev, p];
      return prev.map((x) =>
        x.productId === p.productId ? { ...x, stock: p.stock } : x
      );
    });
  }, []);

  const handleAdminOrders = useCallback((o) => {
    setOrders((prev) => [o, ...prev]);
    if (o.status === "pending") setPendingOrders((c) => c + 1);
  }, []);

  const fetchAll = async () => {
    try {
      const [
        ordersRes,
        pendingRes,
        monthlyRes,
        lowStockRes,
        productsRes,
        winRes,
      ] = await Promise.all([
        getOrders(),
        getPendingOrdersCount(),
        getMonthlyOrdersCount(),
        getLowStockProducts(),
        getProducts(),
        getWindowStatus(),
      ]);

      setOrders(ordersRes.data);
      setPendingOrders(pendingRes.data.count);
      setMonthlyOrders(monthlyRes.data);
      setLowStockProducts(lowStockRes.data);
      setProducts(productsRes.data);
      setWinOpen(winRes.data.open);
    } catch (e) {
      console.error(e);
      setError(language === "vi" ? "Lỗi tải dữ liệu" : "Load failed");
    }
  };

  useEffect(() => {
    fetchAll();
    const unsubs = [];
    // mỗi subscribe sẽ tự gọi connectStomp() bên trong
    subscribe("/topic/stock", handleStock).then((off) => unsubs.push(off));
    subscribe("/topic/orders/admin", handleAdminOrders).then((off) =>
      unsubs.push(off)
    );
    subscribe("/topic/order-window", ({ open }) => setWinOpen(open)).then(
      (off) => unsubs.push(off)
    );
    return () => unsubs.forEach((off) => off());
  }, [language, subscribe, handleStock, handleAdminOrders]);

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const handleApprove = async (id) => {
    try {
      await approveOrder(id);
      toast.success(language === "vi" ? "Đã duyệt" : "Approved");
      fetchAll();
    } catch {
      toast.error(language === "vi" ? "Duyệt thất bại" : "Approve failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt(
      language === "vi" ? "Lý do từ chối:" : "Rejection reason:"
    );
    if (!reason) return;
    try {
      await rejectOrder(id, reason);
      toast.success(language === "vi" ? "Đã từ chối" : "Rejected");
      fetchAll();
    } catch {
      toast.error(language === "vi" ? "Từ chối thất bại" : "Reject failed");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Bảng Điều Khiển Quản Trị" : "Admin Dashboard"}
      </Typography>

      <Grid container spacing={3}>
        {[
          {
            label: language === "vi" ? "Đang chờ" : "Pending",
            value: pendingOrders,
          },
          {
            label: language === "vi" ? "Tháng này" : "This month",
            value: monthlyOrders,
          },
          {
            label: language === "vi" ? "Tổng SP" : "Products",
            value: products.length,
          },
          {
            label: language === "vi" ? "Tổng đơn" : "Orders",
            value: orders.length,
          },
        ].map((card, i) => (
          <Grid item xs={12} md={6} lg={3} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h6">{card.label}</Typography>
                <Typography variant="h4">{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Order‑Window card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {language === "vi" ? "Cửa Sổ Đặt Hàng" : "Order Window"}
              </Typography>
              <Typography
                variant="h4"
                color={winOpen ? "green" : "error"}
                sx={{ mb: 1 }}
              >
                {winOpen
                  ? language === "vi"
                    ? "Mở"
                    : "Open"
                  : language === "vi"
                  ? "Đóng"
                  : "Closed"}
              </Typography>
              <Button
                size="small"
                onClick={async () => {
                  const res = await toggleWindow();
                  setWinOpen(res.data.open);
                }}
              >
                {language === "vi" ? "Bật/Tắt" : "Toggle"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {language === "vi" ? "Đơn gần đây" : "Recent Orders"}
        </Typography>
        <DataGrid
          rows={orders}
          columns={[
            { field: "orderId", headerName: "ID", width: 80 },
            {
              field: "createdAt",
              headerName: language === "vi" ? "Ngày" : "Date",
              width: 170,
              valueFormatter: ({ value }) =>
                value ? new Date(value).toLocaleString() : "",
            },
            {
              field: "status",
              headerName: language === "vi" ? "Trạng thái" : "Status",
              width: 110,
            },
            {
              field: "adminComment",
              headerName: language === "vi" ? "Ghi chú" : "Comment",
              width: 220,
            },
            {
              field: "action",
              headerName: language === "vi" ? "Hành động" : "Actions",
              width: 190,
              renderCell: ({ row }) =>
                row.status === "pending" && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                      onClick={() => handleApprove(row.orderId)}
                    >
                      {language === "vi" ? "Duyệt" : "Approve"}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(row.orderId)}
                    >
                      {language === "vi" ? "Từ chối" : "Reject"}
                    </Button>
                  </>
                ),
            },
          ]}
          autoHeight
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          getRowId={(r) => r.orderId}
          disableSelectionOnClick
        />
      </Box>

      {/* Low‑Stock */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {language === "vi" ? "Tồn kho thấp" : "Low Stock"}
        </Typography>
        <DataGrid
          rows={lowStockProducts}
          columns={[
            { field: "productId", headerName: "ID", width: 80 },
            { field: "code", headerName: "Code", width: 110 },
            {
              field: "name",
              headerName: language === "vi" ? "Tên" : "Name",
              width: 230,
            },
            {
              field: "unit",
              headerName: language === "vi" ? "Đơn vị" : "Unit",
              width: 90,
            },
            { field: "stock", headerName: "Stock", width: 90 },
          ]}
          autoHeight
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          getRowId={(r) => r.productId}
          disableSelectionOnClick
        />
      </Box>

      {/* Charts */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 {language === "vi" ? "Tồn Kho" : "In Stock"}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={products
                    .slice(0, 5)
                    .map((p) => ({ name: p.name, value: p.stock }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {products.slice(0, 5).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top {topRange} {language === "vi" ? "Đặt Nhiều" : "Ordered"}
            </Typography>
            <FormControl size="small" sx={{ width: 120, mb: 2 }}>
              <InputLabel>{language === "vi" ? "Chọn" : "Select"}</InputLabel>
              <Select
                value={topRange}
                label={language === "vi" ? "Chọn" : "Select"}
                onChange={(e) => setTopRange(e.target.value)}
              >
                {[5, 10, 20].map((n) => (
                  <MenuItem key={n} value={n}>{`Top ${n}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MOCK_TOP_ORDERED.slice(0, topRange)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1976d2" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
