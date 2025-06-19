import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { orderApi } from "services/api"; // Updated import

export default function SubmitSignedDialog({ order, open, onClose, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError(null);
    } else {
      setFile(null);
      setError("Only PDF files are allowed.");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      const form = new FormData();
      form.append("file", file);
      await orderApi.submitSigned(order.orderId, form);
      toast.success("Submitted successfully!");
      onSubmitted();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Signed PDF</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Please upload the signed PDF file for Order #{order.orderId}.
        </Typography>
        <Box mt={2}>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error?.message || String(error)}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!file}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}