// src/components/dialogs/RejectDialog.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
  } from "@mui/material";
  import { useState } from "react";
  
  export default function RejectDialog({ open, onClose, onConfirm }) {
    const [reason, setReason] = useState("");
  
    const handleClose = () => {
      setReason("");
      onClose();
    };
  
    const handleOk = () => {
      onConfirm(reason);
      handleClose();
    };
  
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Rejection reason</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleOk} disabled={!reason.trim()} color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  