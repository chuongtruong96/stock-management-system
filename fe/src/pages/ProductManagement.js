// src/pages/UnifiedProductManagement.js
import { useState, useEffect, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getUnits,
} from "../services/api";
import { WsContext } from "../contexts/WsContext";

const ProductManagement = ({ language }) => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    code: "",
    name: "",
    unitId: "",
    stock: 0,
    price: 0,
  });

  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);

  const { subscribe } = useContext(WsContext);

  // ─── load products & units ──────────────────
  useEffect(() => {
    async function init() {
      try {
        const [pRes, uRes] = await Promise.all([getProducts(), getUnits()]);
        setProducts(pRes.data || []);
        setUnits(uRes.data || []);
      } catch (e) {
        console.error("Init error:", e);
      }
    }
    init();

    // live stock updates
    const unsubs = [];
    subscribe("/topic/stock", (update) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === update.productId ? { ...p, stock: update.stock } : p
        )
      );
    }).then((off) => unsubs.push(off));
    return () => unsubs.forEach((off) => off());
  }, [subscribe]);

  // ─── CRUD helpers ───────────────────────────
  const handleAddProduct = async () => {
    try {
      const { data } = await addProduct({
        ...newProduct,
        unit: units.find((u) => u.id.toString() === newProduct.unitId)?.nameVn,
      });
      setProducts((prev) => [...prev, data]);
      setOpenDialog(false);
      setNewProduct({ code: "", name: "", unitId: "", stock: 0, price: 0 });
    } catch {
      alert("Error adding product");
    }
  };

  const handleEditProduct = async () => {
    try {
      const { data } = await updateProduct(editProduct.id, {
        ...editProduct,
        unit: units.find((u) => u.id === editProduct.unitId)?.nameVn,
      });
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setOpenDialog(false);
      setEditProduct(null);
    } catch {
      alert("Error updating product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (
      !window.confirm(language === "vi" ? "Xác nhận xóa?" : "Confirm delete?")
    )
      return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Error deleting product");
    }
  };

  const handleUpdateStock = async () => {
    try {
      const { data } = await updateStock(selectedProduct.id, newStock);
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setOpenStockDialog(false);
      setSelectedProduct(null);
    } catch {
      alert("Error updating stock");
    }
  };

  // ─── table columns ──────────────────────────
  const columns = [
    { field: "code", headerName: "Code", width: 110 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 200 },
    // ←—— here’s the one fix:
    {
      field: "unit",
      headerName: language === "vi" ? "Đơn vị" : "Unit",
      width: 100,
    },
    { field: "stock", headerName: "Stock", width: 90 },
    { field: "price", headerName: "Price", width: 90 },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      width: 240,
      getActions: ({ row }) => [
        <Button
          size="small"
          onClick={() => {
            setEditProduct({
              ...row,
              unitId: units.find((u) => u.nameVn === row.unit)?.id,
            });
            setOpenDialog(true);
          }}
        >
          {language === "vi" ? "Sửa" : "Edit"}
        </Button>,

        <Button
          size="small"
          color="error"
          onClick={() => handleDeleteProduct(row.id)}
        >
          {language === "vi" ? "Xóa" : "Delete"}
        </Button>,

        <Button
          size="small"
          color="secondary"
          onClick={() => {
            setSelectedProduct(row);
            setNewStock(row.stock);
            setOpenStockDialog(true);
          }}
        >
          {language === "vi" ? "Tồn kho" : "Stock"}
        </Button>,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Quản lý sản phẩm" : "Product Management"}
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          setEditProduct(null);
          setNewProduct({ code: "", name: "", unitId: "", stock: 0, price: 0 });
          setOpenDialog(true);
        }}
      >
        {language === "vi" ? "Thêm" : "Add"}{" "}
        {language === "vi" ? "sản phẩm" : "Product"}
      </Button>

      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(r) => r.id}
        autoHeight
        density="compact"
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
      />

      {/* add / edit dialog */}
      <Dialog
        open={openDialog}
        fullWidth
        maxWidth="sm"
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          {editProduct
            ? language === "vi"
              ? "Sửa sản phẩm"
              : "Edit Product"
            : language === "vi"
            ? "Thêm sản phẩm"
            : "Add Product"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Code"
            fullWidth
            margin="normal"
            value={editProduct?.code || newProduct.code}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, code: e.target.value })
                : setNewProduct({ ...newProduct, code: e.target.value })
            }
          />
          <TextField
            label={language === "vi" ? "Tên" : "Name"}
            fullWidth
            margin="normal"
            value={editProduct?.name || newProduct.name}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, name: e.target.value })
                : setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>{language === "vi" ? "Đơn vị" : "Unit"}</InputLabel>
            <Select
              value={editProduct?.unitId || newProduct.unitId}
              label={language === "vi" ? "Đơn vị" : "Unit"}
              onChange={(e) =>
                editProduct
                  ? setEditProduct({ ...editProduct, unitId: e.target.value })
                  : setNewProduct({ ...newProduct, unitId: e.target.value })
              }
            >
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {language === "vi" ? u.nameVn : u.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Stock"
            type="number"
            fullWidth
            margin="normal"
            value={editProduct?.stock || newProduct.stock}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, stock: +e.target.value })
                : setNewProduct({ ...newProduct, stock: +e.target.value })
            }
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={editProduct?.price || newProduct.price}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, price: +e.target.value })
                : setNewProduct({ ...newProduct, price: +e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            onClick={editProduct ? handleEditProduct : handleAddProduct}
          >
            {editProduct
              ? language === "vi"
                ? "Cập nhật"
                : "Update"
              : language === "vi"
              ? "Thêm"
              : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* stock dialog */}
      <Dialog open={openStockDialog} onClose={() => setOpenStockDialog(false)}>
        <DialogTitle>
          {language === "vi" ? "Cập nhật tồn kho" : "Update Stock"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="New Stock"
            type="number"
            fullWidth
            margin="normal"
            value={newStock}
            onChange={(e) => setNewStock(+e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)}>
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button variant="contained" onClick={handleUpdateStock}>
            {language === "vi" ? "Cập nhật" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
