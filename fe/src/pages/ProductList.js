// src/pages/ProductList.js
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, TextField, Button } from '@mui/material';
import { getProducts } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ProductList = ({ language }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 }); // Added for MUI 7.x
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProducts();
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchData();

        const savedCart = JSON.parse(localStorage.getItem('orderItems')) || [];
        setCart(savedCart);
    }, []);

    useEffect(() => {
        localStorage.setItem('orderItems', JSON.stringify(cart));
    }, [cart]);

    const handleAddToCart = (product) => {
        const existingItem = cart.find((item) => item.productId === product.productId);
        if (existingItem) {
            alert(language === 'vi' ? 'Sản phẩm đã có trong giỏ hàng!' : 'Product already in cart!');
            return;
        }
        setCart([...cart, { ...product, quantity: 1 }]);
    };

    const handleProceedToOrder = () => {
        if (cart.length === 0) {
            alert(language === 'vi' ? 'Giỏ hàng trống!' : 'Cart is empty!');
            return;
        }
        navigate('/order-form');
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { field: 'code', headerName: language === 'vi' ? 'Mã Sản Phẩm' : 'Product Code', width: 150 },
        { field: 'name', headerName: language === 'vi' ? 'Tên Sản Phẩm' : 'Product Name', width: 300 },
        { field: 'unit', headerName: language === 'vi' ? 'Đơn Vị' : 'Unit', width: 100 },
        {
            field: 'action',
            headerName: language === 'vi' ? 'Hành Động' : 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddToCart(params.row)}
                >
                    {language === 'vi' ? 'Thêm Vào Giỏ' : 'Add to Cart'}
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Danh Sách Sản Phẩm' : 'Product List'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label={language === 'vi' ? 'Tìm Kiếm' : 'Search'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleProceedToOrder}>
                    {language === 'vi' ? 'Tiến Hành Đặt Hàng' : 'Proceed to Order'}
                </Button>
            </Box>
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={filteredProducts}
                    columns={columns}
                    paginationModel={paginationModel} // Updated for MUI 7.x
                    onPaginationModelChange={setPaginationModel} // Updated for MUI 7.x
                    pageSizeOptions={[10, 25, 50]} // Updated for MUI 7.x
                    getRowId={(row) => row.productId}
                    disableSelectionOnClick
                />
            </Box>
        </Box>
    );
};

export default ProductList;