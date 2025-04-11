// src/pages/OrderForm.js
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField } from '@mui/material';
import { createOrder, getUserInfo } from '../services/api';
import { useNavigate } from 'react-router-dom';

const OrderForm = ({ language }) => {
    const [orderItems, setOrderItems] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [department, setDepartment] = useState('');
    const date = new Date().toISOString().split('T')[0]; 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo();
                const userData = response.data;
                setEmployee(userData.employee || null); // Fallback to null if employee is undefined
                setDepartment(userData.employee?.department?.name || 'N/A'); // Fallback to 'N/A' if department is undefined
            } catch (error) {
                console.error('Error fetching user info:', error);
                setEmployee(null);
                setDepartment('N/A');
            }
        };
        fetchUserInfo();

        const items = JSON.parse(localStorage.getItem('orderItems')) || [];
        setOrderItems(items);
    }, []);

    const handleQuantityChange = (id, newQuantity) => {
        setOrderItems(
            orderItems.map((item) =>
                item.productId === id ? { ...item, quantity: parseInt(newQuantity) || 1 } : item
            )
        );
    };

    const handleRemoveItem = (id) => {
        const updatedItems = orderItems.filter((item) => item.productId !== id);
        setOrderItems(updatedItems);
        localStorage.setItem('orderItems', JSON.stringify(updatedItems));
    };

    const handleSubmitOrder = async () => {
        if (!employee?.employeeId) {
            alert(language === 'vi' ? 'Không thể gửi đơn hàng: Thông tin nhân viên không khả dụng.' : 'Cannot submit order: Employee information is unavailable.');
            return;
        }

        try {
            const orderData = {
                employeeId: employee.employeeId,
                items: orderItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            };
            await createOrder(orderData);
            alert(language === 'vi' ? 'Đơn hàng đã được gửi thành công! Email đã được gửi đến quản trị viên.' : 'Order submitted successfully! An email has been sent to the admin.');
            localStorage.removeItem('orderItems');
            navigate('/dashboard');
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi gửi đơn hàng: ' + error.response?.data?.message : 'Error submitting order: ' + error.response?.data?.message);
        }
    };

    const columns = [
        { field: 'code', headerName: language === 'vi' ? 'Mã Sản Phẩm' : 'Code', width: 100 },
        { field: 'name', headerName: language === 'vi' ? 'Tên Sản Phẩm' : 'Name', width: 300 },
        { field: 'unit', headerName: language === 'vi' ? 'Đơn Vị' : 'Unit', width: 100 },
        {
            field: 'quantity',
            headerName: language === 'vi' ? 'Số Lượng' : 'Quantity',
            width: 150,
            renderCell: (params) => (
                <TextField
                    type="number"
                    value={params.row.quantity}
                    onChange={(e) => handleQuantityChange(params.row.productId, e.target.value)}
                    inputProps={{ min: 1 }}
                    size="small"
                />
            ),
        },
        {
            field: 'action',
            headerName: language === 'vi' ? 'Hành Động' : 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveItem(params.row.productId)}
                >
                    {language === 'vi' ? 'Xóa' : 'Remove'}
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Mẫu Đơn Hàng' : 'Order Form'}
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Typography>{language === 'vi' ? 'Phòng Ban' : 'Department'}: {department}</Typography>
                <Typography>
                    {language === 'vi' ? 'Nhân Viên' : 'Employee'}: {employee ? `${employee.firstName} ${employee.lastName}` : 'Loading...'}
                </Typography>
                <Typography>{language === 'vi' ? 'Ngày' : 'Date'}: {date}</Typography>
            </Box>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={orderItems}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    getRowId={(row) => row.productId}
                    disableSelectionOnClick
                />
            </Box>
            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmitOrder}
                disabled={orderItems.length === 0}
            >
                {language === 'vi' ? 'Gửi Đơn Hàng' : 'Submit Order'}
            </Button>
        </Box>
    );
};

export default OrderForm;