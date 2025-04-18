// src/pages/ProductList.jsx
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, TextField, Button, Card, CardContent } from "@mui/material";
import { getProducts } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/styles/custom.css";

const ProductList = ({ language }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();

    const savedCart = JSON.parse(localStorage.getItem("orderItems")) || [];
    setCart(savedCart);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("orderItems", JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setCart(updatedCart);
    } else {
      const { id, code, name, unit } = product; 
      setCart([...cart, { id, code, name, unit, quantity: 1 }]);
    }
    toast.success(
      `${product.name} ${
        language === "vi" ? "đã được thêm vào giỏ hàng!" : "added to cart!"
      }`
    );
  };

  const handleProceedToOrder = () => {
    if (cart.length === 0) {
      alert(language === "vi" ? "Giỏ hàng trống!" : "Cart is empty!");
      return;
    }
    navigate("/order-form");
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: "code",
      headerName: language === "vi" ? "Mã Sản Phẩm" : "Product Code",
      width: 150,
    },
    {
      field: "name",
      headerName: language === "vi" ? "Tên Sản Phẩm" : "Product Name",
      width: 200,
    },
    {
      field: "unit",
      headerName: language === "vi" ? "Đơn Vị" : "Unit",
      width: 100,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          className="btn-primary"
          onClick={() => handleAddToCart(params.row)}
        >
          {language === "vi" ? "Thêm Vào Giỏ" : "Add to Cart"}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Card className="mui-card" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {language === "vi" ? "Danh Sách Sản Phẩm" : "Product List"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <TextField
              label={language === "vi" ? "Tìm Kiếm" : "Search"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              className="btn-primary"
              onClick={handleProceedToOrder}
            >
              {language === "vi"
                ? `Tiến Hành Đặt Hàng (${cart.length})`
                : `Proceed to Order (${cart.length})`}
            </Button>
          </Box>
          <Box className="custom-datagrid">
            <DataGrid
              rows={filteredProducts}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 25, 50]}
              getRowId={(row) => row.id ?? row.code}
              disableSelectionOnClick
              autoHeight
            />
          </Box>

          {cart.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                {language === "vi" ? "Giỏ Hàng Hiện Tại" : "Current Cart"}
              </Typography>
              <ul>
                {cart.map((item, index) => (
                  <li key={index}>
                    {item.name} ({item.quantity}) - {item.unit}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductList;
