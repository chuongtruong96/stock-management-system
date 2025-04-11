// src/pages/AdminDashboard.js
import { useState, useEffect } from 'react';
import {Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getPendingOrdersCount, getMonthlyOrdersCount, getLowStockProducts } from '../services/api';

const AdminDashboard = ({ language }) => {
    const [pendingOrders, setPendingOrders] = useState(0);
    const [monthlyOrders, setMonthlyOrders] = useState(0);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [error, setError] = useState(null);

    // Định nghĩa các cột cho DataGrid
    const columns = [
        { field: 'productId', headerName: language === 'vi' ? 'ID Sản Phẩm' : 'Product ID', width: 120 },
        { field: 'code', headerName: language === 'vi' ? 'Mã Sản Phẩm' : 'Code', width: 150 },
        { field: 'name', headerName: language === 'vi' ? 'Tên Sản Phẩm' : 'Name', width: 200 },
        { field: 'unit', headerName: language === 'vi' ? 'Đơn Vị' : 'Unit', width: 120 },
        { field: 'stock', headerName: language === 'vi' ? 'Tồn Kho' : 'Stock', width: 120 },
        { field: 'price', headerName: language === 'vi' ? 'Giá' : 'Price', width: 120 },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [pendingRes, monthlyRes, lowStockRes] = await Promise.all([
                    getPendingOrdersCount(),
                    getMonthlyOrdersCount(),
                    getLowStockProducts(),
                ]);
                setPendingOrders(pendingRes.data.count);
                setMonthlyOrders(monthlyRes.data.count);
                setLowStockProducts(lowStockRes.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching dashboard data:', error.response?.data || error.message);
                setError(language === 'vi' ? 'Lỗi khi tải dữ liệu bảng điều khiển' : 'Error loading dashboard data');
            }
        };
        fetchDashboardData();
    }, [language]);

    if (error) {
        return (
            <Box sx={{ pt: 8, p: 3 }}>
                <Typography variant="h4" color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ pt: 8, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Bảng Điều Khiển Quản Trị' : 'Admin Dashboard'}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{language === 'vi' ? 'Đơn Hàng Đang Chờ' : 'Pending Orders'}</Typography>
                            <Typography variant="h4">{pendingOrders}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{language === 'vi' ? 'Đơn Hàng Tháng Này' : 'Orders This Month'}</Typography>
                            <Typography variant="h4">{monthlyOrders}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                {language === 'vi' ? 'Sản Phẩm Tồn Kho Thấp (Tồn < 10)' : 'Low Stock Products (Stock < 10)'}
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={lowStockProducts}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                    getRowId={(row) => row.productId}
                    disableSelectionOnClick
                />
            </Box>
        </Box>
    );
};

export default AdminDashboard;