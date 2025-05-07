// src/pages/Reports.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../services/api";

const Reports = ({ language }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [orders, setOrders] = useState([]);

  const handleGenerateReport = async () => {
    try {
      const response = await api.get("/reports", {
        params: { year, month },
      });
      setOrders(response.data.map((row, idx) => ({ id: idx, ...row })));
    } catch (error) {
      alert(
        language === "vi" ? "Lỗi khi tạo báo cáo" : "Error generating report"
      );
    }
  };

  const handleExportExcel = async () => {
    try {
      const queryParam = `${year}-${month}`;
      const response = await api.get("/reports/export/excel", {
        params: { month: queryParam },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${year}_${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert(
        language === "vi" ? "Lỗi khi xuất Excel" : "Error exporting to Excel"
      );
    }
  };

  const handleExportPDF = async () => {
    try {
      const queryParam = `${year}-${month}`;
      const response = await api.get("/reports/export/pdf", {
        params: { month: queryParam },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${year}_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert(
        language === "vi" ? "Lỗi khi xuất PDF" : "Error exporting to PDF"
      );
    }
  };

 // Reports.jsx
const columns = [
  { field: "department",    headerName: language === "vi" ? "Phòng ban"   : "Department", width: 180 },
  { field: "productCode",   headerName: language === "vi" ? "Mã SP"       : "Product Code", width: 120 },
  { field: "productNameVn", headerName: language === "vi" ? "Tên Sản Phẩm": "Product Name", width: 250 },
  { field: "quantity",      headerName: language === "vi" ? "Số Lượng"    : "Quantity",    width: 120 },
  { field: "unit",          headerName: language === "vi" ? "Đơn Vị"      : "Unit",        width: 100 },
];


  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Báo Cáo Hàng Tháng" : "Monthly Reports"}
      </Typography>
      <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{language === "vi" ? "Tháng" : "Month"}</InputLabel>
          <Select value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={language === "vi" ? "Năm" : "Year"}
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <Button variant="contained" className="btn-primary" onClick={handleGenerateReport}>
          {language === "vi" ? "Tạo Báo Cáo" : "Generate Report"}
        </Button>
      </Box>
      <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
        <Button variant="contained" color="success" onClick={handleExportExcel}>
          {language === "vi" ? "Xuất Excel" : "Export to Excel"}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleExportPDF}>
          {language === "vi" ? "Xuất PDF" : "Export to PDF"}
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Typography variant="subtitle1" color="error">
          {language === "vi"
            ? "Không có dữ liệu trong tháng-năm này."
            : "No data found for this month-year."}
        </Typography>
      ) : (
        <Box className="custom-datagrid">
          <DataGrid
            rows={orders}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            getRowId={(row) => row.id}         
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      )}
    </Box>
  );
};

export default Reports;
