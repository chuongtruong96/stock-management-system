// src/pages/AdminDashboard.js
import { useState, useEffect } from "react";
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
} from "../services/api";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/**
 * Giả lập dữ liệu top sản phẩm được order.
 * Thực tế, bạn cần backend trả về thống kê: { productName, totalOrdered }.
 */
const MOCK_TOP_ORDERED = [
  { productName: "Bút Bi Thiên Long", total: 120 },
  { productName: "Giấy A4 Double A", total: 95 },
  { productName: "Bìa Kẹp Hồ Sơ", total: 80 },
  { productName: "Bút Chì 2B", total: 74 },
  { productName: "Sổ Tay Mini", total: 62 },
  { productName: "Băng Keo Trong", total: 59 },
  { productName: "File 13 Ngăn", total: 50 },
  { productName: "Kẹp Giấy 2cm", total: 45 },
  { productName: "Bút Lông Dầu", total: 39 },
  { productName: "Gôm/Tẩy Thiên Long", total: 32 },
  { productName: "Bút Dạ Quang", total: 29 },
  { productName: "Bút Lông Bảng", total: 25 },
  // ... etc
];

const AdminDashboard = ({ language }) => {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // state: user chọn top N sp
  const [topRange, setTopRange] = useState(10);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8E44AD"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, pendingRes, monthlyRes, lowStockRes, productsRes] =
          await Promise.all([
            getOrders(),
            getPendingOrdersCount(),
            getMonthlyOrdersCount(),
            getLowStockProducts(),
            getProducts(),
          ]);

        setOrders(ordersRes.data);
        setPendingOrders(pendingRes.data.count);
        setMonthlyOrders(monthlyRes.data);
        setLowStockProducts(lowStockRes.data);
        setProducts(productsRes.data);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        setError(language === "vi" ? "Lỗi tải dữ liệu" : "Failed to load data");
      }
    };
    fetchData();
  }, [language]);

  // Thay vì department / approve vs. reject => Bỏ

  const handleApprove = async (orderId) => {
    try {
      await approveOrder(orderId);
      toast.success(
        language === "vi" ? "Đã duyệt đơn hàng!" : "Order approved!"
      );
      refreshOrders();
    } catch {
      toast.error(
        language === "vi" ? "Lỗi khi duyệt đơn hàng" : "Approve failed"
      );
    }
  };

  const handleReject = async (orderId) => {
    const comment = prompt(
      language === "vi" ? "Lý do từ chối:" : "Rejection reason:"
    );
    if (!comment) return;
    try {
      await rejectOrder(orderId, comment);
      toast.success(language === "vi" ? "Đã từ chối đơn hàng" : "Order rejected");
      refreshOrders();
    } catch {
      toast.error(
        language === "vi" ? "Lỗi từ chối đơn hàng" : "Reject failed"
      );
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch {}
  };

  // Tính top N sp order
  const topOrderedProductsData = MOCK_TOP_ORDERED.slice(0, topRange);

  const lowStockColumns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "code",
      headerName: language === "vi" ? "Mã SP" : "Code",
      width: 120,
    },
    {
      field: "name",
      headerName: language === "vi" ? "Tên SP" : "Name",
      width: 200,
    },
    {
      field: "unit",
      headerName: language === "vi" ? "Đơn Vị" : "Unit",
      width: 120,
    },
    {
      field: "stock",
      headerName: language === "vi" ? "Tồn Kho" : "Stock",
      width: 120,
    },
  ];

  const orderColumns = [
    { field: "orderId", headerName: "ID", width: 80 },
    {
      field: "createdAt",
      headerName: language === "vi" ? "Ngày tạo" : "Created At",
      width: 200,
    },
    {
      field: "status",
      headerName: language === "vi" ? "Trạng thái" : "Status",
      width: 150,
    },
    {
      field: "adminComment",
      headerName: language === "vi" ? "Ghi chú" : "Comment",
      width: 200,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành động" : "Action",
      width: 200,
      renderCell: (params) =>
        params.row.status === "pending" && (
          <>
            <Button
              variant="contained"
              size="small"
              color="success"
              sx={{ mr: 1 }}
              onClick={() => handleApprove(params.row.orderId)}
            >
              {language === "vi" ? "Duyệt" : "Approve"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => handleReject(params.row.orderId)}
            >
              {language === "vi" ? "Từ chối" : "Reject"}
            </Button>
          </>
        ),
    },
  ];

  if (error) {
    return (
      <Box
        sx={{
          pt: 8,
          p: 3,
          backgroundColor: "#fafafa",
          borderRadius: "10px",
          minHeight: "80vh",
        }}
      >
        <Typography variant="h4" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        pt: 8,
        p: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Bảng Điều Khiển Quản Trị" : "Admin Dashboard"}
      </Typography>

      {/* Thông tin tổng quát */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card
            sx={{
              backgroundColor: "#fff",
              boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Typography variant="h6">
                {language === "vi" ? "Đơn hàng đang chờ" : "Pending Orders"}
              </Typography>
              <Typography variant="h4">{pendingOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: "#fff", boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography variant="h6">
                {language === "vi" ? "Đơn hàng tháng này" : "Orders This Month"}
              </Typography>
              <Typography variant="h4">{monthlyOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Số lượng sản phẩm tổng */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: "#fff", boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography variant="h6">
                {language === "vi" ? "Tổng sản phẩm" : "Total Products"}
              </Typography>
              <Typography variant="h4">{products.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Ở đây thay vì hiển thị đơn hàng đã duyệt / từ chối, ta bỏ vì chắc chắn được duyệt */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ backgroundColor: "#fff", boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
            <CardContent>
              <Typography variant="h6">
                {language === "vi" ? "Tổng Đơn Hàng" : "Total Orders"}
              </Typography>
              <Typography variant="h4">{orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bảng đơn hàng gần đây */}
      <Box sx={{ mt: 4, backgroundColor: "#fff", p: 2, borderRadius: "8px", boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
        <Typography variant="h5" gutterBottom>
          {language === "vi" ? "Đơn hàng gần đây" : "Recent Orders"}
        </Typography>
        <DataGrid
          rows={orders}
          columns={orderColumns}
          pageSize={5}
          getRowId={(row) => row.orderId}
          rowsPerPageOptions={[5, 10]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>

      {/* Bảng sản phẩm tồn kho thấp */}
      <Box sx={{ mt: 4, backgroundColor: "#fff", p: 2, borderRadius: "8px", boxShadow: "0 1px 5px rgba(0,0,0,0.1)" }}>
        <Typography variant="h5" gutterBottom>
          {language === "vi" ? "Sản phẩm tồn kho thấp" : "Low Stock Products"}
        </Typography>
        <DataGrid
          rows={lowStockProducts}
          columns={lowStockColumns}
          pageSize={5}
          getRowId={(row) => row.id}
          rowsPerPageOptions={[5, 10]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* Pie: top 5 sản phẩm còn nhiều hàng */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "#fff",
              p: 2,
              borderRadius: "8px",
              boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {language === "vi" ? "Sản phẩm nhiều nhất (Top 5)" : "Top 5 Most Available Products"}
            </Typography>
            {products.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {language === "vi" ? "Chưa có dữ liệu" : "No data yet"}
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={products.slice(0, 5).map((p) => ({
                      name: p.name,
                      value: p.stock,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {products.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Grid>

        {/* Bar: top sp được order (range 10, 20) */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              backgroundColor: "#fff",
              p: 2,
              borderRadius: "8px",
              boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {language === "vi"
                ? "Top Sản Phẩm Được Order Nhiều Nhất"
                : "Top Most Ordered Products"}
            </Typography>
            {/* Chọn top N */}
            <FormControl size="small" sx={{ mb: 2, width: 120 }}>
              <InputLabel>
                {language === "vi" ? "Chọn Top" : "Select Top"}
              </InputLabel>
              <Select
                value={topRange}
                label={language === "vi" ? "Chọn Top" : "Select Top"}
                onChange={(e) => setTopRange(e.target.value)}
              >
                <MenuItem value={5}>Top 5</MenuItem>
                <MenuItem value={10}>Top 10</MenuItem>
                <MenuItem value={20}>Top 20</MenuItem>
              </Select>
            </FormControl>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={MOCK_TOP_ORDERED.slice(0, topRange).map((item) => ({
                  name: item.productName,
                  total: item.total,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#1976d2" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

