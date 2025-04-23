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
import {
  getOrdersByDepartment,
  getOrderItems,
  getUserInfo,
} from "../services/api";
import "../assets/styles/custom.css";

const OrderHistory = ({ language }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  /* -------------------------------------------------
     FETCH tất cả đơn của phòng ban hiện tại
     ------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        /* userInfo trả về { departmentId, … }  */
        const { data: user } = await getUserInfo();
        const deptId = user.departmentId ?? user.department?.id;
        if (!deptId) {
          console.error("User has no department!");
          return;
        }
        const res = await getOrdersByDepartment(deptId);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    })();
  }, [language]);

  /* ------------------------------------------------- */
  const handleViewDetails = async (orderId) => {
    try {
      const res = await getOrderItems(orderId);
      setOrderItems(res.data);
      setSelectedOrder(orders.find((o) => o.orderId === orderId));
    } catch {
      alert(
        language === "vi"
          ? "Lỗi khi lấy chi tiết đơn hàng"
          : "Error fetching order details"
      );
    }
  };

  /* ------------------------------------------------- */
  const orderColumns = [
    {
      field: "orderId",
      headerName: language === "vi" ? "Mã Đơn" : "Order ID",
      width: 100,
    },
    {
      field: "createdAt",
      headerName: language === "vi" ? "Ngày Tạo" : "Date",
      width: 190,
    },
    {
      field: "status",
      headerName: language === "vi" ? "Trạng Thái" : "Status",
      width: 140,
    },
    {
      field: "adminComment",
      headerName: language === "vi" ? "Bình Luận" : "Admin Comment",
      width: 280,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleViewDetails(params.row.orderId)}
        >
          {language === "vi" ? "Chi Tiết" : "Details"}
        </Button>
      ),
    },
  ];

  const itemColumns = [
    { field: "orderItemId", headerName: "ID", width: 80 },
    { field: "productId", headerName: "SP", width: 90 },
    {
      field: "productName",
      headerName: language === "vi" ? "Tên Sản Phẩm" : "Product",
      width: 250,
    },
    {
      field: "quantity",
      headerName: language === "vi" ? "Số Lượng" : "Qty",
      width: 90,
    },
    {
      field: "unitNameVn",
      headerName: language === "vi" ? "Đơn Vị" : "Unit",
      width: 100,
    },
  ];

  /* ------------------------------------------------- */
  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Card className="mui-card" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {language === "vi" ? "Lịch Sử Đơn Hàng" : "Order History"}
          </Typography>

          <Box className="custom-datagrid">
            <DataGrid
              rows={orders}
              columns={orderColumns}
              autoHeight
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              getRowId={(r) => r.orderId}
              disableSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* ---------- Dialog chi tiết ---------- */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {language === "vi"
            ? `Chi Tiết Đơn #${selectedOrder?.orderId}`
            : `Order #${selectedOrder?.orderId} Details`}
        </DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography>
                {language === "vi" ? "Trạng Thái" : "Status"}:{" "}
                {selectedOrder.status}
              </Typography>
              <Typography>
                {language === "vi" ? "Ngày Tạo" : "Date"}:{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
              {selectedOrder.adminComment && (
                <Typography>
                  {language === "vi" ? "Bình Luận" : "Admin Comment"}:{" "}
                  {selectedOrder.adminComment}
                </Typography>
              )}

              <Box sx={{ height: 300, mt: 2 }}>
                <DataGrid
                  rows={orderItems}
                  columns={itemColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  getRowId={(r) => r.orderItemId}
                  disableSelectionOnClick
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;
