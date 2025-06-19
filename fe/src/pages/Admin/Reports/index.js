import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/template/MDBox";
import MDTypography from "components/template/MDTypography";
import MDButton from "components/template/MDButton";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import { toast } from "react-toastify";

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import api from "services/api";

import { buildTable } from "./tableData";

export default function Reports({ language = "en" }) {
  /* -------- state -------- */
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]); // raw report rows
  const [table, setTable] = useState({ columns: [], rows: [] });

  /* -------- build table every rows/lang change -------- */
  useEffect(() => setTable(buildTable(rows, language)), [rows, language]);

  /* -------- actions -------- */
  const fetchReport = async () => {
    try {
      const { data } = await api.get("/reports", { params: { year, month } });
      setRows(data.map((r, i) => ({ id: i, ...r })));
      if (!data.length)
        toast.info(
          language === "vi"
            ? "Không có dữ liệu cho tháng‑năm này"
            : "No data for this period"
        );
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    }
  };

  const exportFile = async (ext) => {
    try {
      const { data } = await api.get(`/reports/export/${ext}`, {
        params: { month: `${year}-${month}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${year}_${month}.${ext}`);
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(language === "vi" ? "Xuất lỗi" : "Export failed");
    }
  };

  /* -------- UI -------- */
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={2}
            px={2}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              {language === "vi" ? "Báo cáo hàng tháng" : "Monthly Reports"}
            </MDTypography>
          </MDBox>

          {/* --- controls --- */}
          <MDBox
            display="flex"
            gap={2}
            flexWrap="wrap"
            mb={3}
            mt={2}
            justifyContent="space-between"
            alignItems="center"
            mx={2}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{language === "vi" ? "Tháng" : "Month"}</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label={language === "vi" ? "Năm" : "Year"}
              type="number"
              value={year}
              onChange={(e) => setYear(+e.target.value)}
              sx={{ width: 110 }}
            />

            <MDButton color="info" variant="gradient" onClick={fetchReport}>
              {language === "vi" ? "Tạo báo cáo" : "Generate"}
            </MDButton>

            <Box flexGrow={1} />

            <MDButton
              color="success"
              variant="outlined"
              onClick={() => exportFile("excel")}
            >
              Excel
            </MDButton>

            <MDButton
              color="secondary"
              variant="outlined"
              onClick={() => exportFile("pdf")}
            >
              PDF
            </MDButton>
          </MDBox>

          {/* --- table / empty msg --- */}
          {rows.length ? (
            <DataTable
              table={table}
              entriesPerPage={{ defaultValue: 10, entries: [10, 25, 50] }}
              canSearch
              noEndBorder
            />
          ) : (
            <MDBox py={6} textAlign="center">
              <MDTypography variant="button" color="text">
                {language === "vi"
                  ? "Chưa có dữ liệu, hãy chọn tháng / năm và nhấn tạo."
                  : "Pick month & year then press Generate."}
              </MDTypography>
            </MDBox>
          )}
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
