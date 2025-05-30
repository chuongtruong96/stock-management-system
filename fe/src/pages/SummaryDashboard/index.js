import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import { toast } from "react-toastify";
import { Grid, TextField, Card, CardContent } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrow from "@mui/icons-material/PlayArrow";

import { summaryApi } from "services/api"; // Updated import

const today = () => new Date().toISOString().slice(0, 10);

export default function SummaryDashboard({ language = "en" }) {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const response = await summaryApi.fetch(from, to); // Updated to summaryApi.fetch
      setRows(response);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    load();
  }, [from, to]);

  const table = useMemo(
    () => ({
      columns: [
        { Header: "Dept", accessor: "departmentId", width: "10%", align: "center" },
        {
          Header: "Date",
          accessor: "date",
          width: "15%",
          align: "center",
          Cell: ({ value }) => new Date(value).toLocaleDateString(),
        },
        { Header: "Total", accessor: "totalOrders", align: "center" },
        { Header: "Approved", accessor: "approvedCount", align: "center" },
        { Header: "Rejected", accessor: "rejectedCount", align: "center" },
        { Header: "Pending", accessor: "pendingCount", align: "center" },
      ],
      rows: rows.map((r) => ({ ...r, id: r.id ?? `${r.departmentId}-${r.date}` })),
    }),
    [rows]
  );

  const runNow = async () => {
    try {
      await summaryApi.run(from, to); // Updated to summaryApi.run
      toast.success("Aggregated!");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

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
              Order Summaries
            </MDTypography>
          </MDBox>
          <CardContent>
            <Grid container spacing={2} mb={3} marginTop={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Grid>
              <Grid item xs="auto">
                <MDButton
                  color="info"
                  variant="gradient"
                  startIcon={<RefreshIcon />}
                  onClick={load}
                >
                  {language === "vi" ? "Làm mới" : "Refresh"}
                </MDButton>
              </Grid>
              <Grid item xs="auto">
                <MDButton
                  variant="outlined"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={runNow}
                >
                  {language === "vi" ? "Chạy ngay" : "Run now"}
                </MDButton>
              </Grid>
            </Grid>
            <DataTable
              table={table}
              isSorted
              canSearch
              showTotalEntries
              entriesPerPage={{ defaultValue: 10, entries: [10, 25, 50] }}
              pagination={{ variant: "gradient", color: "info" }}
              noEndBorder
            />
          </CardContent>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}