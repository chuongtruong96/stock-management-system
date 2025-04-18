// src/pages/OrderForm.jsx
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import { createOrder, getUserInfo } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../assets/styles/custom.css";

const OrderForm = ({ language }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserInfo();
        const userData = response.data;
        setCurrentUser(userData);
        setDepartmentName(userData.department?.name || "N/A");
      } catch (error) {
        console.error("Error fetching user info:", error);
        setCurrentUser(null);
        setDepartmentName("N/A");
      }
    };
    fetchUserInfo();

    const items = JSON.parse(localStorage.getItem("orderItems")) || [];
    setOrderItems(items);
  }, [language]);

  const handleQuantityChange = (id, newQuantity) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: parseInt(newQuantity) || 1 } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    const updatedItems = orderItems.filter((item) => item.id !== id);
    setOrderItems(updatedItems);
    localStorage.setItem("orderItems", JSON.stringify(updatedItems));
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        items: orderItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      console.log(orderData);
      await createOrder(orderData);
      alert(
        language === "vi"
          ? "Đơn hàng đã được gửi thành công!"
          : "Order submitted successfully!"
      );
      localStorage.removeItem("orderItems");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(
        language === "vi"
          ? "Lỗi: " + (error.response?.data?.message || error.message)
          : "Error: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const columns = [
    {
      field: "code",
      headerName: language === "vi" ? "Mã SP" : "Code",
      width: 100,
    },
    {
      field: "name",
      headerName: language === "vi" ? "Tên Sản Phẩm" : "Name",
      width: 200,
    },
    {
      field: "unit",
      headerName: language === "vi" ? "Đơn Vị" : "Unit",
      width: 100,
    },
    {
      field: "quantity",
      headerName: language === "vi" ? "Số Lượng" : "Quantity",
      width: 150,
      renderCell: (params) => (
        <TextField
          type="number"
          value={params.row.quantity}
          onChange={(e) => handleQuantityChange(params.row.id, e.target.value)}
          inputProps={{ min: 1 }}
          size="small"
        />
      ),
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleRemoveItem(params.row.id)}
        >
          {language === "vi" ? "Xóa" : "Remove"}
        </Button>
      ),
    },
  ];

  const date = new Date().toISOString().split("T")[0];

  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Card className="mui-card" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {language === "vi" ? "Mẫu Đơn Hàng" : "Order Form"}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography>
              {language === "vi" ? "Phòng Ban" : "Department"}: {departmentName}
            </Typography>
            <Typography>
              {language === "vi" ? "Người Dùng" : "User"}:{" "}
              {currentUser ? currentUser.username : "Loading..."}
            </Typography>
            <Typography>
              {language === "vi" ? "Ngày" : "Date"}: {date}
            </Typography>
          </Box>
          <Box className="custom-datagrid">
            <DataGrid
              rows={orderItems}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              getRowId={(row) => row.id ?? row.code}
              disableSelectionOnClick
              autoHeight
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSubmitOrder}
            disabled={orderItems.length === 0}
            className="btn-primary"
          >
            {language === "vi" ? "Gửi Đơn Hàng" : "Submit Order"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderForm;
