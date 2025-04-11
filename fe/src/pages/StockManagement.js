// src/pages/StockManagement.js
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getProducts, updateProductStock } from '../services/api';

const StockManagement = ({ language }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newStock, setNewStock] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleUpdateStock = async () => {
        try {
            const response = await updateProductStock(selectedProduct.productId, newStock);
            setProducts(products.map((prod) => (prod.productId === selectedProduct.productId ? response.data : prod)));
            setSelectedProduct(null);
            setNewStock(0);
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi cập nhật tồn kho' : 'Error updating stock');
        }
    };

    const columns = [
        { field: 'code', headerName: language === 'vi' ? 'Mã Sản Phẩm' : 'Code', width: 100 },
        { field: 'name', headerName: language === 'vi' ? 'Tên Sản Phẩm' : 'Name', width: 300 },
        { field: 'unit', headerName: language === 'vi' ? 'Đơn Vị' : 'Unit', width: 100 },
        { field: 'stock', headerName: language === 'vi' ? 'Tồn Kho' : 'Stock', width: 100 },
        {
            field: 'action',
            headerName: language === 'vi' ? 'Hành Động' : 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setSelectedProduct(params.row);
                        setNewStock(params.row.stock);
                    }}
                >
                    {language === 'vi' ? 'Cập Nhật Tồn Kho' : 'Update Stock'}
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Quản Lý Tồn Kho' : 'Stock Management'}
            </Typography>
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

            <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
                <DialogTitle>
                    {language === 'vi' ? `Cập Nhật Tồn Kho: ${selectedProduct?.name}` : `Update Stock: ${selectedProduct?.name}`}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label={language === 'vi' ? 'Số Lượng Tồn Kho Mới' : 'New Stock Quantity'}
                        type="number"
                        fullWidth
                        margin="normal"
                        value={newStock}
                        onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                        inputProps={{ min: 0 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedProduct(null)}>{language === 'vi' ? 'Hủy' : 'Cancel'}</Button>
                    <Button onClick={handleUpdateStock} color="primary">
                        {language === 'vi' ? 'Cập Nhật' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StockManagement;