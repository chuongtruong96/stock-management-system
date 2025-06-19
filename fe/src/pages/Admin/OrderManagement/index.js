import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Avatar,
  Stack,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as OrderIcon,
  FileDownload as DownloadIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AdminLayout from "layouts/AdminLayout";
import { orderApi } from "services/api";
import OrderDialog from "./OrderDialog";

export default function EnhancedOrderManagement({ language = "en" }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.all();
      console.log('Orders response:', response);
      
      // Handle different response formats
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && response.content && Array.isArray(response.content)) {
        ordersData = response.content;
      } else if (response && response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDialog = (order, mode) => setDialog({ order, mode });
  const closeDialog = () => setDialog(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await orderApi.delete(id);
      setOrders(prev => prev.filter(order => order.orderId !== id));
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const handleApprove = async (order) => {
    try {
      await orderApi.approve(order.orderId, "Approved by admin");
      toast.success("Order approved successfully");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to approve order");
    }
    handleMenuClose();
  };

  const handleReject = async (order) => {
    try {
      await orderApi.reject(order.orderId, "Rejected by admin");
      toast.success("Order rejected");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to reject order");
    }
    handleMenuClose();
  };

  const handleMenuClick = (event, order) => {
    setMenuAnchor(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'submitted': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'exported': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'submitted': return '📋';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'exported': return '📄';
      default: return '📝';
    }
  };

  const columns = [
    {
      field: "orderId",
      headerName: "Order ID",
      width: 120,
      renderCell: ({ row }) => (
        <Chip
          label={`#${row.orderId}`}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: ({ row }) => (
        <Chip
          icon={<span>{getStatusIcon(row.status)}</span>}
          label={row.status || 'Unknown'}
          size="small"
          color={getStatusColor(row.status)}
          sx={{ fontWeight: 600, minWidth: 100 }}
        />
      ),
    },
    {
      field: "departmentName",
      headerName: "Department",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.departmentName || 'Unknown Department'}
        </Typography>
      ),
    },
    {
      field: "createdBy",
      headerName: "Created By",
      width: 140,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.createdBy || 'Unknown User'}
        </Typography>
      ),
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
    {
      field: "createdTime",
      headerName: "Created Time",
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="body2" color="textSecondary">
          {row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '—'}
        </Typography>
      ),
    },
    {
      field: "itemCount",
      headerName: "Items",
      width: 80,
      renderCell: ({ row }) => (
        <Chip
          label={row.itemCount || 0}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "adminComment",
      headerName: "Comment",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {row.adminComment || 'No comment'}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => openDialog(row, 'view')}
            sx={{
              bgcolor: 'info.50',
              '&:hover': { bgcolor: 'info.100' }
            }}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          
          {row.status === 'submitted' && (
            <IconButton
              size="small"
              onClick={() => handleApprove(row)}
              sx={{
                bgcolor: 'success.50',
                '&:hover': { bgcolor: 'success.100' }
              }}
            >
              <ApproveIcon fontSize="small" />
            </IconButton>
          )}
          
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, row)}
            sx={{
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout titleKey="orderManagement" icon="assignment">
      <Box sx={{ p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            boxShadow: 1
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <OrderIcon />
            </Avatar>
            {language === "vi" ? "Quản lý đơn hàng" : "Order Management"}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Export functionality
                toast.info("Export feature coming soon");
              }}
              sx={{ borderRadius: 2 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<OrderIcon />}
              onClick={fetchOrders}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>
        
        <Box sx={{ 
          height: 600, 
          width: "100%",
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1
        }}>
          <DataGrid
            rows={orders}
            columns={columns}
            getRowId={(row) => row.orderId}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            loading={loading}
            rowHeight={80}
            sx={{
              border: 'none',
              "& .MuiDataGrid-root": {
                border: 'none',
              },
              "& .MuiDataGrid-cell": {
                borderBottom: '1px solid #f0f0f0',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
              },
              "& .MuiDataGrid-columnHeaders": { 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                minHeight: '56px !important',
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 'bold',
              },
              "& .MuiDataGrid-row": {
                minHeight: '80px !important',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  bgcolor: "rgba(25, 118, 210, 0.04)",
                  transform: 'translateY(-1px)',
                },
              },
              "& .MuiDataGrid-toolbarContainer": {
                padding: '16px',
                borderBottom: '1px solid #e0e0e0',
                bgcolor: '#fafafa',
              },
            }}
          />
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 200,
          }
        }}
      >
        <MenuItem onClick={() => {
          openDialog(selectedOrder, 'view');
          handleMenuClose();
        }} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText 
            primary={language === "vi" ? "Xem chi tiết" : "View Details"}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>
        
        {selectedOrder?.status === 'submitted' && (
          <>
            <Divider />
            <MenuItem onClick={() => handleApprove(selectedOrder)} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <ApproveIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={language === "vi" ? "Phê duyệt" : "Approve"}
                primaryTypographyProps={{ fontWeight: 500, color: 'success.main' }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleReject(selectedOrder)} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <RejectIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText 
                primary={language === "vi" ? "Từ chối" : "Reject"}
                primaryTypographyProps={{ fontWeight: 500, color: 'error.main' }}
              />
            </MenuItem>
          </>
        )}
        
        <Divider />
        <MenuItem onClick={() => {
          handleDelete(selectedOrder?.orderId);
          handleMenuClose();
        }} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary={language === "vi" ? "Xóa" : "Delete"}
            primaryTypographyProps={{ fontWeight: 500, color: 'error.main' }}
          />
        </MenuItem>
      </Menu>

      {/* Order Dialog */}
      {dialog && (
        <OrderDialog
          dialog={dialog}
          onClose={closeDialog}
          onApproved={fetchOrders}
          language={language}
        />
      )}
    </AdminLayout>
  );
}