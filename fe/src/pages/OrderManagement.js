// src/pages/OrderManagement.jsx
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Card,
  CardContent
} from "@mui/material";
import { getOrders, updateOrder, deleteOrder } from "../services/api";
import "../assets/styles/custom.css";

const OrderManagement = ({ language }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        setOrders(res.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [language]);

  const handleUpdateOrder = async () => {
    try {
      const updated = {
        ...selectedOrder,
        adminComment,
      };
      const res = await updateOrder(selectedOrder.orderId, updated);
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === selectedOrder.orderId ? res.data : order
        )
      );
      setSelectedOrder(null);
      setAdminComment("");
    } catch (error) {
      alert(language === "vi" ? "Lỗi cập nhật đơn hàng" : "Error updating order");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(language === "vi" ? "Xác nhận xóa?" : "Delete confirm?"))
      return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (error) {
      alert(language === "vi" ? "Lỗi xóa đơn hàng" : "Error deleting order");
    }
  };

  const columns = [
    { field: "orderId", headerName: "ID", width: 80 },
    {
      field: "createdAt",
      headerName: language === "vi" ? "Ngày tạo" : "Created At",
      width: 180,
    },
    {
      field: "status",
      headerName: language === "vi" ? "Trạng Thái" : "Status",
      width: 120,
    },
    {
      field: "adminComment",
      headerName: language === "vi" ? "Ghi chú Quản Trị" : "Admin Comment",
      width: 200,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setSelectedOrder(params.row);
              setAdminComment(params.row.adminComment || "");
            }}
            sx={{ mr: 1 }}
          >
            {language === "vi" ? "Sửa" : "Edit"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteOrder(params.row.orderId)}
          >
            {language === "vi" ? "Xóa" : "Delete"}
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Card className="mui-card" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {language === "vi" ? "Quản lý đơn hàng" : "Order Management"}
          </Typography>
          <Box className="custom-datagrid">
            <DataGrid
              rows={orders}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              getRowId={(row) => row.orderId}
              disableSelectionOnClick
              autoHeight
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedOrder}
        onClose={() => {
          setSelectedOrder(null);
          setAdminComment("");
        }}
      >
        <DialogTitle>
          {language === "vi" ? "Sửa Ghi Chú" : "Edit Admin Comment"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={language === "vi" ? "Ghi chú" : "Comment"}
            fullWidth
            multiline
            minRows={3}
            margin="normal"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button onClick={handleUpdateOrder} variant="contained">
            {language === "vi" ? "Cập Nhật" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;
