// src/pages/Reports.js
import { useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../services/api';

const Reports = ({ language }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [orders, setOrders] = useState([]);

    const handleGenerateReport = async () => {
        try {
            const response = await api.get('/reports', {
                params: { month, year },
            });
            setOrders(response.data);
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi tạo báo cáo' : 'Error generating report');
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get('/reports/export/excel', {
                params: { month, year },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${year}_${month}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi xuất Excel' : 'Error exporting to Excel');
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await api.get('/reports/export/pdf', {
                params: { month, year },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${year}_${month}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert(language === 'vi' ? 'Lỗi khi xuất PDF' : 'Error exporting to PDF');
        }
    };

    const columns = [
        { field: 'orderId', headerName: language === 'vi' ? 'Mã Đơn Hàng' : 'Order ID', width: 100 },
        { field: 'departmentId', headerName: language === 'vi' ? 'Mã Phòng Ban' : 'Department ID', width: 150 },
        { field: 'employeeName', headerName: language === 'vi' ? 'Nhân Viên' : 'Employee', width: 200 },
        { field: 'status', headerName: language === 'vi' ? 'Trạng Thái' : 'Status', width: 150 },
        { field: 'createdAt', headerName: language === 'vi' ? 'Ngày Tạo' : 'Created At', width: 200 },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {language === 'vi' ? 'Báo Cáo Hàng Tháng' : 'Monthly Reports'}
            </Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <FormControl sx={{ mr: 2, minWidth: 120 }}>
                    <InputLabel>{language === 'vi' ? 'Tháng' : 'Month'}</InputLabel>
                    <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                        {[...Array(12)].map((_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label={language === 'vi' ? 'Năm' : 'Year'}
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ mr: 2 }}
                />
                <Button variant="contained" color="primary" onClick={handleGenerateReport}>
                    {language === 'vi' ? 'Tạo Báo Cáo' : 'Generate Report'}
                </Button>
            </Box>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <Button variant="contained" color="success" onClick={handleExportExcel} sx={{ mr: 2 }}>
                    {language === 'vi' ? 'Xuất Excel' : 'Export to Excel'}
                </Button>
                <Button variant="contained" color="secondary" onClick={handleExportPDF}>
                    {language === 'vi' ? 'Xuất PDF' : 'Export to PDF'}
                </Button>
            </Box>
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={orders}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    getRowId={(row) => row.orderId}
                    disableSelectionOnClick
                />
            </Box>
        </Box>
    );
};

export default Reports;