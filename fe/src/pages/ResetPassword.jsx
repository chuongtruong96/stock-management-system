import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { TextField, Button, Stack, Typography, Paper } from "@mui/material";
import { toast } from "react-toastify";
import api from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pw.trim()) {
      toast.error("Password is required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset", { token, newPw: pw });
      toast.success("Password updated – please log in");
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <Navigate to="/login" />;

  return (
    <Paper
      elevation={3}
      sx={{ maxWidth: 400, mx: "auto", mt: 10, p: 4, textAlign: "center" }}
    >
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="New password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        >
          {loading ? "Processing..." : "Reset"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ResetPassword;
