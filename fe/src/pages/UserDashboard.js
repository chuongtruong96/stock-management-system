// src/pages/UserDashboard.js
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { getLatestOrder, checkOrderPeriod } from '../services/api';

const UserDashboard = ({ language }) => {
    const [latestOrder, setLatestOrder] = useState(null);
    const [daysRemaining, setDaysRemaining] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [orderRes, periodRes] = await Promise.all([
                    getLatestOrder(),
                    checkOrderPeriod(),
                ]);
                setLatestOrder(orderRes.data);
                if (periodRes.data.canOrder) {
                    const today = new Date().getDate();
                    setDaysRemaining(7 - today + 1);
                } else {
                    setDaysRemaining(0);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <Box sx={{ pt: 8, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Bảng Điều Khiển Người Dùng' : 'User Dashboard'}
            </Typography>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6">{language === 'vi' ? 'Đơn Hàng Gần Nhất' : 'Latest Order'}</Typography>
                    {latestOrder ? (
                        <>
                            <Typography>{language === 'vi' ? 'Mã Đơn Hàng' : 'Order ID'}: {latestOrder.orderId}</Typography>
                            <Typography>{language === 'vi' ? 'Ngày Tạo' : 'Date'}: {latestOrder.createdAt}</Typography>
                            <Typography>{language === 'vi' ? 'Trạng Thái' : 'Status'}: {latestOrder.status}</Typography>
                            {latestOrder.adminComment && (
                                <Typography>{language === 'vi' ? 'Bình Luận Quản Trị' : 'Admin Comment'}: {latestOrder.adminComment}</Typography>
                            )}
                        </>
                    ) : (
                        <Typography>{language === 'vi' ? 'Chưa có đơn hàng nào.' : 'No orders yet.'}</Typography>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">{language === 'vi' ? 'Thời Gian Đặt Hàng' : 'Order Period'}</Typography>
                    {daysRemaining > 0 ? (
                        <Typography>
                            {language === 'vi'
                                ? `Bạn còn ${daysRemaining} ngày để đặt hàng trong tháng này.`
                                : `You have ${daysRemaining} day(s) left to place an order this month.`}
                        </Typography>
                    ) : (
                        <Typography>
                            {language === 'vi'
                                ? 'Thời gian đặt hàng đã đóng cho tháng này. Sẽ mở lại vào ngày 1 tháng sau.'
                                : 'Ordering is closed for this month. It will reopen on the 1st of next month.'}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default UserDashboard;