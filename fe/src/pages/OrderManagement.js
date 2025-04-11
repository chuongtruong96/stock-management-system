import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getOrders, getOrderItems, approveOrder, rejectOrder } from '../services/api';

const OrderManagement = ({ language }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [orderIdToReject, setOrderIdToReject] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getOrders();
                console.log('Orders response:', response.data);
                const mappedOrders = response.data.map(order => ({
                    ...order,
                    departmentId: order.departmentId || 'N/A',
                    employeeName: order.employeeName || 'N/A',
                }));
                setOrders(mappedOrders);
                setError(null);
            } catch (error) {
                console.error('Error fetching orders:', error.response?.data || error.message);
                setError(language === 'vi' ? 'Lỗi khi tải danh sách đơn hàng' : 'Error fetching orders');
            }
        };
        fetchOrders();
    }, [language]);

    const handleViewDetails = async (orderId) => {
        try {
            const response = await getOrderItems(orderId);
            console.log('Order items response:', response.data);
            if (response.data && response.data.length > 0) {
                const validOrderItems = response.data
                    .filter(item => item && item.orderItemId && item.productId && item.productName && item.quantity)
                    .map(item => ({
                        ...item,
                        unitNameVn: item.unitNameVn || 'N/A',
                        unitNameEn: item.unitNameEn || 'N/A',
                    }));
                if (validOrderItems.length > 0) {
                    setOrderItems(validOrderItems);
                    setSelectedOrder(orders.find((order) => order.orderId === orderId));
                } else {
                    alert(
                        language === 'vi'
                            ? 'Không có chi tiết đơn hàng hợp lệ cho đơn hàng này.'
                            : 'No valid order details available for this order.'
                    );
                    setOrderItems([]);
                    setSelectedOrder(null);
                }
            } else {
                alert(
                    language === 'vi'
                        ? 'Không có chi tiết đơn hàng cho đơn hàng này.'
                        : 'No order details available for this order.'
                );
                setOrderItems([]);
                setSelectedOrder(null);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            alert(
                language === 'vi'
                    ? `Lỗi khi lấy chi tiết đơn hàng: ${errorMessage}`
                    : `Error fetching order details: ${errorMessage}`
            );
            setOrderItems([]);
            setSelectedOrder(null);
        }
    };

    const handleApprove = async (orderId) => {
        try {
            await approveOrder(orderId);
            setOrders(orders.map((order) => order.orderId === orderId ? { ...order, status: 'approved' } : order));
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi phê duyệt đơn hàng' : 'Error approving order');
        }
    };

    const handleReject = (orderId) => {
        setOrderIdToReject(orderId);
        setOpenRejectDialog(true);
    };

    const confirmReject = async () => {
        try {
            await rejectOrder(orderIdToReject, comment);
            setOrders(orders.map((order) => order.orderId === orderIdToReject ? { ...order, status: 'rejected', adminComment: comment } : order));
            setOpenRejectDialog(false);
            setComment('');
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi từ chối đơn hàng' : 'Error rejecting order');
        }
    };

    const columns = [
        { field: 'orderId', headerName: language === 'vi' ? 'Mã Đơn Hàng' : 'Order ID', width: 100 },
        { field: 'departmentId', headerName: language === 'vi' ? 'Mã Phòng Ban' : 'Department ID', width: 150 },
        { field: 'employeeName', headerName: language === 'vi' ? 'Nhân Viên' : 'Employee', width: 200 },
        { field: 'status', headerName: language === 'vi' ? 'Trạng Thái' : 'Status', width: 120 },
        { field: 'createdAt', headerName: language === 'vi' ? 'Ngày Tạo' : 'Created At', width: 200 },
        {
            field: 'actions',
            headerName: language === 'vi' ? 'Hành Động' : 'Actions',
            width: 250,
            renderCell: (params) => (
                <div>
                    <Button onClick={() => handleViewDetails(params.row.orderId)}>
                        {language === 'vi' ? 'Xem Chi Tiết' : 'View Details'}
                    </Button>
                    {params.row.status === 'pending' && (
                        <>
                            <Button onClick={() => handleApprove(params.row.orderId)} color="primary" sx={{ mx: 1 }}>
                                {language === 'vi' ? 'Phê Duyệt' : 'Approve'}
                            </Button>
                            <Button onClick={() => handleReject(params.row.orderId)} color="secondary">
                                {language === 'vi' ? 'Từ Chối' : 'Reject'}
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const itemColumns = [
        { field: 'productId', headerName: language === 'vi' ? 'Mã Sản Phẩm' : 'Product ID', width: 100 },
        { field: 'productName', headerName: language === 'vi' ? 'Tên Sản Phẩm' : 'Product Name', width: 300 },
        { field: 'quantity', headerName: language === 'vi' ? 'Số Lượng' : 'Quantity', width: 100 },
        {
            field: 'unit',
            headerName: language === 'vi' ? 'Đơn Vị' : 'Unit',
            width: 100,
            renderCell: (params) => {
                const value = language === 'vi' ? params.row.unitNameVn : params.row.unitNameEn;
                return value || 'N/A';
            },
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
                {language === 'vi' ? 'Quản Lý Đơn Hàng' : 'Order Management'}
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={orders}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    getRowId={(row) => row.orderId}
                    disableSelectionOnClick
                />
            </Box>

            {selectedOrder && (
                <>
                    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                        {language === 'vi' ? 'Chi Tiết Đơn Hàng' : 'Order Details'} #{selectedOrder.orderId}
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <DataGrid
                            rows={orderItems}
                            columns={itemColumns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10]}
                            getRowId={(row) => row.orderItemId}
                            disableSelectionOnClick
                        />
                    </Box>
                </>
            )}

            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                <DialogTitle>{language === 'vi' ? 'Từ Chối Đơn Hàng' : 'Reject Order'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={language === 'vi' ? 'Lý Do Từ Chối' : 'Reason for Rejection'}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)}>
                        {language === 'vi' ? 'Hủy' : 'Cancel'}
                    </Button>
                    <Button onClick={confirmReject} color="secondary">
                        {language === 'vi' ? 'Xác Nhận' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderManagement;