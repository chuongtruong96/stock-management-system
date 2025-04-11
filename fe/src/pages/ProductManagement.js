// src/pages/ProductManagement.js
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getProducts, addProduct, updateProduct, deleteProduct, getUnits } from '../services/api';

const ProductManagement = ({ language }) => {
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newProduct, setNewProduct] = useState({ code: '', name: '', unit: '', stock: 0, price: 0 });
    const [editProduct, setEditProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsRes = await getProducts();
                setProducts(productsRes.data);
                setError(null); // Reset error khi thành công
            } catch (error) {
                console.error('Error fetching products:', error.response?.data || error.message);
                setError(language === 'vi' ? 'Lỗi khi tải danh sách sản phẩm' : 'Error loading products');
            }
        };

        const fetchUnits = async () => {
            try {
                const unitsRes = await getUnits();
                setUnits(unitsRes.data);
                setError(null); // Reset error khi thành công
            } catch (error) {
                console.error('Error fetching units:', error.response?.data || error.message);
                setError(language === 'vi' ? 'Lỗi khi tải danh sách đơn vị' : 'Error loading units');
            }
        };

        fetchProducts();
        fetchUnits();
    }, [language]);

    const handleAddProduct = async () => {
        try {
            const response = await addProduct(newProduct);
            setProducts([...products, response.data]);
            setOpenDialog(false);
            setNewProduct({ code: '', name: '', unit: '', stock: 0, price: 0 });
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi thêm sản phẩm' : 'Error adding product');
        }
    };

    const handleEditProduct = async () => {
        try {
            const response = await updateProduct(editProduct.productId, editProduct);
            setProducts(products.map((prod) => (prod.productId === editProduct.productId ? response.data : prod)));
            setEditProduct(null);
            setOpenDialog(false);
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi cập nhật sản phẩm' : 'Error updating product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteProduct(productId);
            setProducts(products.filter((prod) => prod.productId !== productId));
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi xóa sản phẩm' : 'Error deleting product');
        }
    };

    const columns = [
        { field: 'code', headerName: language === 'vi' ? 'Mã Sản Phẩm' : 'Code', width: 100 },
        { field: 'name', headerName: language === 'vi' ? 'Tên Sản Phẩm' : 'Name', width: 300 },
        { field: 'unit', headerName: language === 'vi' ? 'Đơn Vị' : 'Unit', width: 100 },
        { field: 'stock', headerName: language === 'vi' ? 'Tồn Kho' : 'Stock', width: 100 },
        { field: 'price', headerName: language === 'vi' ? 'Giá' : 'Price', width: 100 },
        {
            field: 'action',
            headerName: language === 'vi' ? 'Hành Động' : 'Action',
            width: 200,
            renderCell: (params) => (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => { setEditProduct(params.row); setOpenDialog(true); }}
                        sx={{ mr: 1 }}
                    >
                        {language === 'vi' ? 'Sửa' : 'Edit'}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteProduct(params.row.productId)}
                    >
                        {language === 'vi' ? 'Xóa' : 'Delete'}
                    </Button>
                </>
            ),
        },
    ];

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Quản Lý Sản Phẩm' : 'Product Management'}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
                {language === 'vi' ? 'Thêm Sản Phẩm' : 'Add Product'}
            </Button>
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={products}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    getRowId={(row) => row.productId}
                    disableSelectionOnClick
                />
            </Box>

            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditProduct(null); }}>
                <DialogTitle>{editProduct ? (language === 'vi' ? 'Sửa Sản Phẩm' : 'Edit Product') : (language === 'vi' ? 'Thêm Sản Phẩm' : 'Add Product')}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={language === 'vi' ? 'Mã Sản Phẩm' : 'Code'}
                        fullWidth
                        margin="normal"
                        value={editProduct ? editProduct.code : newProduct.code}
                        onChange={(e) => editProduct
                            ? setEditProduct({ ...editProduct, code: e.target.value })
                            : setNewProduct({ ...newProduct, code: e.target.value })}
                    />
                    <TextField
                        label={language === 'vi' ? 'Tên Sản Phẩm' : 'Name'}
                        fullWidth
                        margin="normal"
                        value={editProduct ? editProduct.name : newProduct.name}
                        onChange={(e) => editProduct
                            ? setEditProduct({ ...editProduct, name: e.target.value })
                            : setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>{language === 'vi' ? 'Đơn Vị' : 'Unit'}</InputLabel>
                        <Select
                            value={editProduct ? editProduct.unit : newProduct.unit}
                            onChange={(e) => editProduct
                                ? setEditProduct({ ...editProduct, unit: e.target.value })
                                : setNewProduct({ ...newProduct, unit: e.target.value })}
                        >
                            {units.map((unit) => (
                                <MenuItem key={unit.id} value={unit.nameVn}>
                                    {language === 'vi' ? unit.nameVn : unit.nameEn}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label={language === 'vi' ? 'Tồn Kho' : 'Stock'}
                        type="number"
                        fullWidth
                        margin="normal"
                        value={editProduct ? editProduct.stock : newProduct.stock}
                        onChange={(e) => editProduct
                            ? setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })
                            : setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    />
                    <TextField
                        label={language === 'vi' ? 'Giá' : 'Price'}
                        type="number"
                        fullWidth
                        margin="normal"
                        value={editProduct ? editProduct.price : newProduct.price}
                        onChange={(e) => editProduct
                            ? setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })
                            : setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(false); setEditProduct(null); }}>
                        {language === 'vi' ? 'Hủy' : 'Cancel'}
                    </Button>
                    <Button onClick={editProduct ? handleEditProduct : handleAddProduct} color="primary">
                        {editProduct ? (language === 'vi' ? 'Cập Nhật' : 'Update') : (language === 'vi' ? 'Thêm' : 'Add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductManagement;