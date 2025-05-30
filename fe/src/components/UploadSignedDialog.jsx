import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { orderApi } from "services/api"; // Updated import
import { toast } from "react-toastify";

export default function UploadSignedDialog({ open, order, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setErr(null);
    } else {
      setFile(null);
      setErr("PDF only");
    }
  };

  const upload = async () => {
    const fd = new FormData();
    fd.append("file", file);
    await orderApi.submitSigned(order.orderId, fd); // Updated to orderApi.submitSigned
    toast.success("Uploaded!");
    onDone();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload signed PDF</DialogTitle>
      <DialogContent dividers>
        <Box>Choose the PDF signed by your manager.</Box>
        <input type="file" accept="application/pdf" onChange={onFile} />
        {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!file} onClick={upload} variant="contained">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}