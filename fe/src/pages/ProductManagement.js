// UnifiedProductManagement.js
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
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
  MenuItem
} from '@mui/material';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getUnits
} from '../services/api';

const ProductManagement = ({ language }) => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);

  // Dialog chung cho thêm / sửa product
  const [openDialog, setOpenDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    unit: '',
    stock: 0,
    price: 0,
  });

  // Dialog cập nhật stock riêng
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [pRes, uRes] = await Promise.all([getProducts(), getUnits()]);
        setProducts(pRes.data || []);
        setUnits(uRes.data || []);
      } catch (error) {
        console.error('Error init:', error);
      }
    };
    fetchInitial();
  }, [language]);

  // Thêm product
  const handleAddProduct = async () => {
    try {
      const resp = await addProduct(newProduct);
      setProducts((prev) => [...prev, resp.data]);
      setOpenDialog(false);
      setNewProduct({ code: '', name: '', unit: '', stock: 0, price: 0 });
    } catch (error) {
      alert('Error adding product');
    }
  };

  // Sửa product (ngoại trừ stock?), hoặc bạn có thể sửa luôn stock
  const handleEditProduct = async () => {
    try {
      // "editProduct" là object đầy đủ
      const resp = await updateProduct(editProduct.productId, editProduct);
      setProducts((prev) =>
        prev.map((p) => (p.productId === editProduct.productId ? resp.data : p))
      );
      setEditProduct(null);
      setOpenDialog(false);
    } catch (error) {
      alert('Error updating product');
    }
  };

  // Xoá
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (error) {
      alert('Error deleting product');
    }
  };

  // Mở dialog update stock
  const openUpdateStockDialog = (row) => {
    setSelectedProduct(row);
    setNewStock(row.stock);
    setOpenStockDialog(true);
  };

  // Xác nhận update stock
  const handleUpdateStock = async () => {
    try {
      const resp = await updateProductStock(selectedProduct.productId, newStock);
      // resp.data là product sau update
      setProducts((prev) =>
        prev.map((p) => (p.productId === selectedProduct.productId ? resp.data : p))
      );
      setOpenStockDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      alert('Error updating stock');
    }
  };

  // DataGrid columns
  const columns = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Name', width: 300 },
    { field: 'unit', headerName: 'Unit', width: 100 },
    { field: 'stock', headerName: 'Stock', width: 100 },
    { field: 'price', headerName: 'Price', width: 100 },
    {
      field: 'action',
      headerName: 'Action',
      width: 300,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              console.log('Edit product row:', params.row);
              setEditProduct(params.row); // object
              setOpenDialog(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              console.log('Delete product row:', params.row);
              handleDeleteProduct(params.row.productId);
            }}
            style={{ marginLeft: 5 }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => openUpdateStockDialog(params.row)}
            style={{ marginLeft: 5 }}
          >
            Update Stock
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Product Management (Unified)</Typography>
      <Button
        variant="contained"
        onClick={() => {
          setEditProduct(null);
          setNewProduct({ code: '', name: '', unit: '', stock: 0, price: 0 });
          setOpenDialog(true);
        }}
        sx={{ mb: 2 }}
      >
        Add Product
      </Button>
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row.productId ?? row.code}
          pageSize={10}
        />
      </Box>

      {/* Dialog để thêm / sửa product */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setEditProduct(null);
          setOpenDialog(false);
        }}
      >
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Code"
            fullWidth
            margin="normal"
            value={editProduct ? editProduct.code : newProduct.code}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, code: e.target.value })
                : setNewProduct({ ...newProduct, code: e.target.value })
            }
          />
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editProduct ? editProduct.name : newProduct.name}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, name: e.target.value })
                : setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Unit</InputLabel>
            <Select
              value={editProduct ? editProduct.unit : newProduct.unit}
              onChange={(e) =>
                editProduct
                  ? setEditProduct({ ...editProduct, unit: e.target.value })
                  : setNewProduct({ ...newProduct, unit: e.target.value })
              }
            >
              {units.map((u) => (
                <MenuItem key={u.id} value={u.nameVn}>
                  {u.nameVn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Stock"
            type="number"
            fullWidth
            margin="normal"
            value={editProduct ? editProduct.stock : newProduct.stock}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })
                : setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
            }
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={editProduct ? editProduct.price : newProduct.price}
            onChange={(e) =>
              editProduct
                ? setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })
                : setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditProduct(null);
              setOpenDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editProduct ? handleEditProduct : handleAddProduct}
            variant="contained"
          >
            {editProduct ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog update stock */}
      <Dialog
        open={openStockDialog}
        onClose={() => {
          setOpenStockDialog(false);
          setSelectedProduct(null);
        }}
      >
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <TextField
            label="New Stock"
            type="number"
            fullWidth
            margin="normal"
            value={newStock}
            onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenStockDialog(false);
              setSelectedProduct(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateStock} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
