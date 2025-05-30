import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import MDBadge from "components/MDBadge";
import { orderApi } from "services/api"; // Already correctly imported
import { toast } from "react-toastify";

const REJECT_REASONS = ["Out of budget", "Incorrect items", "Other"];

export default function OrderDialog({ dialog, onClose, onApproved, language }) {
  const { order, mode } = dialog; // mode = "view" | "approve" | "reject"
  const [items, setItems] = useState([]);
  const [comment, setComment] = useState(order.adminComment || "");
  const [reason, setReason] = useState(REJECT_REASONS[0]); // khi reject
  const [custom, setCustom] = useState("");

  /* ---- lấy line‑items khi cần ---- */
  useEffect(() => {
    if (mode === "view") {
      orderApi.getItems(order.orderId).then((r) => setItems(r)); // Updated to orderApi.getItems, removed .data
    }
  }, [mode, order.orderId]);

  /* ---- helpers gửi API ---- */
  const doApprove = async () => {
    await orderApi.approve(order.orderId, comment); // Updated to orderApi.approve
    toast.success("Approved!");
    onApproved();
    onClose();
  };

  const doReject = async () => {
    const r = reason === "Other" ? custom : reason;
    if (!r.trim()) return toast.error("Need a reason");
    await orderApi.reject(order.orderId, r); // Updated to orderApi.reject
    toast.info("Rejected");
    onApproved();
    onClose();
  };

  /* ---- table hiển thị line‑item khi VIEW ---- */
  const itemTable = {
    columns: [
      { Header: "ID", accessor: "orderItemId", width: "7%" },
      {
        Header: language === "vi" ? "Mã SP" : "Code",
        accessor: "productId",
        width: "10%",
      },
      {
        Header: language === "vi" ? "Sản phẩm" : "Product",
        accessor: "productName",
      },
      { Header: "Qty", accessor: "quantity", align: "center", width: "10%" },
      {
        Header: language === "vi" ? "Đơn vị" : "Unit",
        accessor: "unitNameVn",
        width: "15%",
      },
    ],
    rows: items,
  };

  /* ---- JSX ---- */
  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>
        {mode === "view" &&
          (language === "vi" ? "Chi tiết đơn" : "Order details")}
        {mode === "approve" &&
          (language === "vi" ? "Duyệt đơn" : "Approve order")}
        {mode === "reject" &&
          (language === "vi" ? "Từ chối đơn" : "Reject order")}
        <MDBadge
          badgeContent={order.status}
          color={
            order.status === "approved"
              ? "success"
              : order.status === "rejected"
              ? "error"
              : order.status === "submitted"
              ? "info"
              : "warning"
          }
          variant="gradient"
          size="sm"
          sx={{ ml: 2 }}
        />
      </DialogTitle>

      <DialogContent dividers>
        {/* ------ MODE = VIEW ------ */}
        {mode === "view" && (
          <DataTable
            table={itemTable}
            entriesPerPage={false}
            canSearch={false}
            showTotalEntries={false}
            noEndBorder
          />
        )}

        {/* ------ MODE = APPROVE hoặc REJECT ------ */}
        {(mode === "approve" || mode === "reject") && (
          <Box mt={1}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label={language === "vi" ? "Ghi chú" : "Comment"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Box>
        )}

        {mode === "reject" && (
          <Box mt={3}>
            <FormControl>
              <FormLabel>{language === "vi" ? "Lý do" : "Reason"}</FormLabel>
              <RadioGroup
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REJECT_REASONS.map((r) => (
                  <FormControlLabel
                    key={r}
                    value={r}
                    control={<Radio />}
                    label={r}
                  />
                ))}
              </RadioGroup>
              {reason === "Other" && (
                <TextField
                  label={language === "vi" ? "Khác" : "Other"}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  sx={{ mt: 1 }}
                />
              )}
            </FormControl>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {language === "vi" ? "Đóng" : "Close"}
        </Button>
        {mode === "approve" && (
          <Button variant="contained" color="success" onClick={doApprove}>
            {language === "vi" ? "Duyệt" : "Approve"}
          </Button>
        )}
        {mode === "reject" && (
          <Button variant="contained" color="error" onClick={doReject}>
            {language === "vi" ? "Từ chối" : "Reject"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}