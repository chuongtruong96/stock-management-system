import React, { useEffect, useState } from "react";
import { fetchSummaries } from "../services/summaryApi";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../services/api"; // Import your API service
export default function SummaryDashboard() {
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(from);

  const load = () =>
    fetchSummaries(null, from, to).then((r) => setRows(r.data));

  useEffect(() => {
    load();
  }, [from, to]);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Order Summaries
      </Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <TextField
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button variant="contained" onClick={load}>
          Refresh
        </Button>
        <Button
  variant="outlined"
  onClick={async () => {
    await api.post("/summaries/run", null, { params: { from, to } });
    load();  // rồi fetch lại GET /api/summaries
  }}
>
  Run Now
</Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={[
          { field: "departmentId", headerName: "Dept", width: 100 },
          { field: "date", headerName: "Date", width: 120 },
          { field: "totalOrders", headerName: "Total", width: 100 },
          { field: "approvedCount", headerName: "Approved", width: 120 },
          { field: "rejectedCount", headerName: "Rejected", width: 120 },
          { field: "pendingCount", headerName: "Pending", width: 120 },
        ]}
        getRowId={(r) => r.id}
        autoHeight
        density="compact"
        pageSize={10}
      />
    </Box>
  );
}
