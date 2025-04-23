// src/pages/OrderManagement.js
import React, { useState, useEffect } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from "@mui/material";
import {
  getOrders,
  getOrderItems,
  approveOrder,
  rejectOrder,
  deleteOrder,
} from "../services/api";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

const REJECT_REASONS = ["Out of budget", "Incorrect items", "Other"];

const OrderManagement = ({ language }) => {
  const [orders, setOrders] = useState([]);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [actionType, setActionType] = useState(null); // 'view','approve','reject'
  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    async function load() {
      try {
        const { data } = await getOrders();
        // map the ISO‐strings to actual Dates
        const withDates = data.map(o => ({
          ...o,
          createdAt: new Date(o.createdAt.split('.')[0]),
          updatedAt: new Date(o.updatedAt.split('.')[0]),
        }));
        setOrders(withDates);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [language]);

  const openDialog = async (order, type) => {
    setActionType(type);
    setDetailOrder(order);
    setCommentText(order.adminComment || "");
    if (type === "view") {
      const res = await getOrderItems(order.orderId);
      setDetailItems(res.data);
    }
    if (type === "reject") {
      setRejectReason(REJECT_REASONS[0]);
      setCustomReason("");
    }
  };

  const closeDialog = () => {
    setActionType(null);
    setDetailOrder(null);
    setDetailItems([]);
    setCommentText("");
  };

  const handleApprove = async () => {
    try {
      await approveOrder(detailOrder.orderId, commentText);
      closeDialog();
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    const reason = rejectReason === "Other" ? customReason : rejectReason;
    try {
      await rejectOrder(detailOrder.orderId, reason);
      closeDialog();
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (orderId) => {
    if (
      !window.confirm(
        language === "vi" ? "Xác nhận hủy đơn?" : "Confirm cancel?"
      )
    )
      return;
    try {
      await deleteOrder(orderId);
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { field: "orderId", headerName: "ID", width: 80 },
    {
      field: 'createdAt',
      headerName: language === 'vi' ? 'Ngày tạo' : 'Created',
      width: 180,
      type: 'dateTime',       // now the cell value is an actual Date
      // no valueFormatter needed — DataGrid will render the Date
    },
    {
      field: "status",
      headerName: language === "vi" ? "Trạng thái" : "Status",
      width: 120,
    },
    {
      field: "adminComment",
      headerName: language === "vi" ? "Ghi chú" : "Comment",
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }) => value || "–",
    },
    {
      field: "actions",
      type: "actions",
      headerName: language === "vi" ? "Hành động" : "Actions",
      width: 160,
      getActions: (params) => {
        const row = params.row;
        return [
          <GridActionsCellItem
            icon={<InfoIcon />}
            label="View"
            onClick={() => openDialog(row, "view")}
          />,
          row.status === "pending" && (
            <GridActionsCellItem
              icon={<CheckIcon color="success" />}
              label="Approve"
              onClick={() => openDialog(row, "approve")}
            />
          ),
          row.status === "pending" && (
            <GridActionsCellItem
              icon={<CloseIcon color="error" />}
              label="Reject"
              onClick={() => openDialog(row, "reject")}
            />
          ),
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Cancel"
            onClick={() => handleDelete(row.orderId)}
            showInMenu
          />,
        ].filter(Boolean);
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card className="mui-card">
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {language === "vi" ? "Quản lý đơn hàng" : "Order Management"}
          </Typography>
          <DataGrid
            rows={orders}
            columns={columns}
            autoHeight // ← required so grid can clean up safely
            density="compact"
            hideFooterRowCount
            hideFooterSelectedRowCount
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            getRowId={(r) => r.orderId}
            disableSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Dialog for view / approve / reject */}
      <Dialog open={!!actionType} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === "view" &&
            (language === "vi" ? "Chi tiết đơn hàng" : "Order Details")}
          {actionType === "approve" &&
            (language === "vi" ? "Duyệt đơn hàng" : "Approve Order")}
          {actionType === "reject" &&
            (language === "vi" ? "Từ chối đơn hàng" : "Reject Order")}
        </DialogTitle>
        <DialogContent dividers>
          {actionType === "view" && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {language === "vi" ? "Các mặt hàng:" : "Line Items:"}
              </Typography>
              <DataGrid
                rows={detailItems}
                columns={[
                  { field: "orderItemId", headerName: "ID", width: 80 },
                  {
                    field: "productId",
                    headerName: language === "vi" ? "Mã SP" : "Product ID",
                    width: 100,
                  },
                  {
                    field: "productName",
                    headerName: language === "vi" ? "Tên SP" : "Name",
                    width: 200,
                  },
                  {
                    field: "quantity",
                    headerName: language === "vi" ? "Số lượng" : "Qty",
                    width: 90,
                  },
                  {
                    field: "unitNameVn",
                    headerName: language === "vi" ? "Đơn vị" : "Unit",
                    width: 100,
                  },
                ]}
                autoHeight // ← again, so it tears down correctly
                hideFooterSelectedRowCount
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                getRowId={(r) => r.orderItemId}
              />
            </Box>
          )}

          {(actionType === "approve" || actionType === "reject") && (
            <Box sx={{ mt: 1 }}>
              <TextField
                label={
                  language === "vi"
                    ? "Ghi chú (tùy chọn)"
                    : "Comment (optional)"
                }
                fullWidth
                multiline
                minRows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                margin="normal"
              />
            </Box>
          )}

          {actionType === "reject" && (
            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  {language === "vi" ? "Lý do từ chối" : "Rejection Reason"}
                </FormLabel>
                <RadioGroup
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  {REJECT_REASONS.map((reason) => (
                    <FormControlLabel
                      key={reason}
                      value={reason}
                      control={<Radio />}
                      label={reason}
                    />
                  ))}
                </RadioGroup>
                {rejectReason === "Other" && (
                  <TextField
                    label={language === "vi" ? "Khác" : "Other reason"}
                    fullWidth
                    margin="normal"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                )}
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={closeDialog}>
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          {actionType === "approve" && (
            <Button variant="contained" color="success" onClick={handleApprove}>
              {language === "vi" ? "Duyệt" : "Approve"}
            </Button>
          )}
          {actionType === "reject" && (
            <Button variant="contained" color="error" onClick={handleReject}>
              {language === "vi" ? "Từ chối" : "Reject"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;
