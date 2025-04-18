// src/pages/OrderHistory.jsx
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
} from "@mui/material";
import { getOrdersByDepartment, getOrderItems, getUserInfo } from "../services/api";
import "../assets/styles/custom.css";

const OrderHistory = ({ language }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userInfo = await getUserInfo();
        const departmentId = userInfo.data.department?.id;
        if (!departmentId) {
          console.error("No department found for current user");
          return;
        }
        const response = await getOrdersByDepartment(departmentId);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [language]);

  const handleViewDetails = async (orderId) => {
    try {
      const response = await getOrderItems(orderId);
      setOrderItems(response.data);
      setSelectedOrder(orders.find((order) => order.orderId === orderId));
    } catch (error) {
      alert(
        language === "vi"
          ? "Lỗi khi lấy chi tiết đơn hàng"
          : "Error fetching order details"
      );
    }
  };

  const orderColumns = [
    {
      field: "orderId",
      headerName: language === "vi" ? "Mã Đơn Hàng" : "Order ID",
      width: 100,
    },
    {
      field: "createdAt",
      headerName: language === "vi" ? "Ngày Tạo" : "Date",
      width: 200,
    },
    {
      field: "status",
      headerName: language === "vi" ? "Trạng Thái" : "Status",
      width: 150,
    },
    {
      field: "adminComment",
      headerName: language === "vi" ? "Bình Luận Quản Trị" : "Admin Comment",
      width: 300,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleViewDetails(params.row.orderId)}
        >
          {language === "vi" ? "Xem Chi Tiết" : "View Details"}
        </Button>
      ),
    },
  ];

  const itemColumns = [
    { field: "orderItemId", headerName: "ID", width: 80 },
    {
      field: "productId",
      headerName: language === "vi" ? "Mã SP" : "Product ID",
      width: 100,
    },
    {
      field: "productName",
      headerName: language === "vi" ? "Tên Sản Phẩm" : "Product Name",
      width: 300,
    },
    {
      field: "quantity",
      headerName: language === "vi" ? "Số Lượng" : "Quantity",
      width: 100,
    },
    {
      field: "unitNameVn",
      headerName: language === "vi" ? "Đơn Vị" : "Unit",
      width: 100,
    },
  ];

  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Card className="mui-card" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {language === "vi" ? "Lịch Sử Đơn Hàng" : "Order History"}
          </Typography>
          <Box className="custom-datagrid">
            <DataGrid
              rows={orders}
              columns={orderColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              getRowId={(row) => row.orderId}
              disableSelectionOnClick
              autoHeight
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        <DialogTitle>
          {language === "vi"
            ? `Chi Tiết Đơn Hàng (Mã: ${selectedOrder?.orderId})`
            : `Order Details (ID: ${selectedOrder?.orderId})`}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {language === "vi" ? "Trạng Thái" : "Status"}: {selectedOrder?.status}
          </Typography>
          <Typography>
            {language === "vi" ? "Ngày Tạo" : "Date"}: {selectedOrder?.createdAt}
          </Typography>
          {selectedOrder?.adminComment && (
            <Typography>
              {language === "vi" ? "Bình Luận Quản Trị" : "Admin Comment"}:{" "}
              {selectedOrder.adminComment}
            </Typography>
          )}
          <Box sx={{ height: 300, width: "100%", mt: 2 }}>
            <DataGrid
              rows={orderItems}
              columns={itemColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              getRowId={(row) => row.orderItemId}
              disableSelectionOnClick
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;
