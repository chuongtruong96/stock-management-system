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
  Paper,
  Card,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress,
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
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  QrCode as CodeIcon,
  Language as LanguageIcon,
  Settings as ActionsIcon,
  Schedule as StatusIcon,
  Business as DepartmentIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon,
  Inventory as ItemsIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AdminLayout from "layouts/AdminLayout";
import LanguageToggle from "components/common/LanguageToggle";
import ConfirmDialog from "components/common/ConfirmDialog";
import { orderApi } from "services/api";
import OrderDialog from "./OrderDialog";

export default function EnhancedOrderManagement() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, order: null });
  const [refreshing, setRefreshing] = useState(false);

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
      toast.error(t("failedToLoadOrders") || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
      toast.success(t("dataRefreshed") || "Data refreshed successfully");
    } catch (error) {
      toast.error(t("refreshFailed") || "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // Compact header component with orange color scheme
  const EnhancedHeader = () => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #ff9500 0%, #ffb347 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Smaller decorative background elements */}
      <Box sx={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        zIndex: 1
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        zIndex: 1
      }} />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            <OrderIcon fontSize="medium" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
              {t("orderManagement") || "Order Management"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
              {t("manageOrdersDescription") || "Manage customer orders and requests"}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LanguageToggle size="small" sx={{ color: 'white' }} />
          <Tooltip title={t("refreshData") || "Refresh Data"}>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <RefreshIcon sx={{ 
                fontSize: '1.2rem',
                animation: refreshing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" }
                }
              }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<DownloadIcon />}
            onClick={() => {
              toast.info(t("exportFeatureComingSoon") || "Export feature coming soon");
            }}
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontSize: '0.875rem',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }
            }}
          >
            {t("export") || "Export"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  // Enhanced table container with beautiful styling
  const EnhancedTableContainer = ({ children }) => (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ff9500 0%, #ffb347 50%, #ff9500 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          }
        }
      }}
    >
      {children}
    </Card>
  );

  // Compact search and filter bar
  const EnhancedSearchBar = () => (
    <Box sx={{ 
      p: 2, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderBottom: '1px solid rgba(0,0,0,0.08)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
          <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary', fontSize: '1.1rem' }}>
            {t("orderInventory") || "Order Inventory"}
          </Typography>
          <Chip 
            label={`${orders.length} ${t("orders") || "orders"}`}
            size="small"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              height: 24,
              '& .MuiChip-label': { px: 1, fontSize: '0.75rem' }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {t("lastUpdated") || "Last updated"}: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Custom header component with beautiful gradient styling
  const CustomColumnHeader = ({ icon: Icon, title }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
      <Icon sx={{ 
        fontSize: '1.2rem', 
        color: 'white',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
      }} />
      <Typography 
        variant="subtitle2" 
        fontWeight={700}
        sx={{ 
          color: 'white',
          letterSpacing: '0.8px',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {title}
      </Typography>
    </Stack>
  );

  const openDialog = (order, mode) => setDialog({ open: true, order, mode });
  const closeDialog = () => setDialog(null);

  const handleDelete = (order) => {
    setDeleteDialog({ open: true, order });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.order) return;
    
    try {
      await orderApi.delete(deleteDialog.order.orderId);
      setOrders(prev => prev.filter(order => order.orderId !== deleteDialog.order.orderId));
      toast.success(t("orderDeleted") || "Order deleted successfully");
      setDeleteDialog({ open: false, order: null });
    } catch (error) {
      toast.error(t("failedToDeleteOrder") || "Failed to delete order");
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, order: null });
  };

  const handleApprove = async (order) => {
    try {
      await orderApi.approve(order.orderId, "Approved by admin");
      toast.success(t("orderApproved") || "Order approved successfully");
      fetchOrders();
    } catch (error) {
      toast.error(t("failedToApproveOrder") || "Failed to approve order");
    }
    handleMenuClose();
  };

  const handleReject = async (order) => {
    try {
      await orderApi.reject(order.orderId, "Rejected by admin");
      toast.success(t("orderRejected") || "Order rejected");
      fetchOrders();
    } catch (error) {
      toast.error(t("failedToRejectOrder") || "Failed to reject order");
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
      headerName: "",
      width: 120,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={CodeIcon} 
          title={i18n.language === 'vi' ? 'Mã ĐH' : 'Order ID'}
        />
      ),
      renderCell: ({ row }) => (
        <Chip
          label={`#${row.orderId}`}
          variant="filled"
          sx={{ 
            background: 'linear-gradient(135deg, #ff9500 0%, #ffb347 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.5px',
            borderRadius: '8px',
            height: '32px',
            boxShadow: '0 2px 8px rgba(255, 149, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(255, 149, 0, 0.4)',
            },
            '& .MuiChip-label': {
              px: 2,
            }
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "",
      width: 140,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={StatusIcon} 
          title={i18n.language === 'vi' ? 'Trạng thái' : 'Status'}
        />
      ),
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
      headerName: "",
      flex: 1,
      minWidth: 150,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={DepartmentIcon} 
          title={i18n.language === 'vi' ? 'Phòng ban' : 'Department'}
        />
      ),
      renderCell: ({ row }) => (
        <Typography 
          variant="body2" 
          fontWeight="500"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={row.departmentName}
        >
          {row.departmentName || 'Unknown Department'}
        </Typography>
      ),
    },
    {
      field: "createdBy",
      headerName: "",
      width: 140,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={PersonIcon} 
          title={i18n.language === 'vi' ? 'Người tạo' : 'Created By'}
        />
      ),
      renderCell: ({ row }) => (
        <Typography 
          variant="body2" 
          fontWeight="500"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={row.createdBy}
        >
          {row.createdBy || 'Unknown User'}
        </Typography>
      ),
    },
    {
      field: "createdDate",
      headerName: "",
      width: 120,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={DateIcon} 
          title={i18n.language === 'vi' ? 'Ngày tạo' : 'Date'}
        />
      ),
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
    {
      field: "createdTime",
      headerName: "",
      width: 120,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={TimeIcon} 
          title={i18n.language === 'vi' ? 'Giờ tạo' : 'Time'}
        />
      ),
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
      headerName: "",
      width: 80,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={ItemsIcon} 
          title={i18n.language === 'vi' ? 'SP' : 'Items'}
        />
      ),
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
      headerName: "",
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={CommentIcon} 
          title={i18n.language === 'vi' ? 'Ghi chú' : 'Comment'}
        />
      ),
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
          title={row.adminComment}
        >
          {row.adminComment || 'No comment'}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 160,
      sortable: false,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={ActionsIcon} 
          title={i18n.language === 'vi' ? 'Thao tác' : 'Actions'}
        />
      ),
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Tooltip title={t("viewOrder") || "View Order"} arrow>
            <IconButton
              size="small"
              onClick={() => openDialog(row, 'view')}
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(79, 195, 247, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(79, 195, 247, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {row.status === 'submitted' && (
            <Tooltip title={t("approveOrder") || "Approve Order"} arrow>
              <IconButton
                size="small"
                onClick={() => handleApprove(row)}
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: '0 4px 12px rgba(102, 187, 106, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }
                }}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title={t("moreActions") || "More Actions"} arrow>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, row)}
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout titleKey="orderManagement" icon="assignment">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            {t("loadingOrders") || "Loading orders..."}
          </Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="orderManagement" icon="assignment">
      {/* Enhanced Header */}
      <EnhancedHeader />

      {/* Enhanced Data Grid with Beautiful Styling */}
      <EnhancedTableContainer>
        <EnhancedSearchBar />
        <Box sx={{ 
          height: 700, 
          width: "100%",
        }}>
          <DataGrid
            rows={orders}
            columns={columns}
            getRowId={(row) => row.orderId}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            loading={loading}
            rowHeight={90}
            sx={{
              border: 'none',
              "& .MuiDataGrid-root": {
                border: 'none',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              },
              "& .MuiDataGrid-cell": {
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                transition: 'all 0.2s ease-in-out',
              },
              "& .MuiDataGrid-columnHeaders": { 
                background: "linear-gradient(135deg, #ff9500 0%, #ffb347 100%)",
                borderBottom: 'none',
                minHeight: '72px !important',
                boxShadow: '0 4px 20px rgba(255, 149, 0, 0.15)',
                '& .MuiDataGrid-columnHeader': {
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                  },
                },
                '& .MuiDataGrid-iconSeparator': {
                  color: 'rgba(255,255,255,0.5)',
                },
                '& .MuiDataGrid-sortIcon': {
                  color: 'white',
                },
                '& .MuiDataGrid-menuIcon': {
                  color: 'white',
                },
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: '700',
                fontSize: '0.9rem',
                color: 'white',
              },
              "& .MuiDataGrid-columnHeader": {
                padding: '16px 20px',
                outline: 'none',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                },
              },
              "& .MuiDataGrid-row": {
                minHeight: '90px !important',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': { 
                  bgcolor: "rgba(255, 149, 0, 0.04)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(255, 149, 0, 0.1)',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid rgba(255, 149, 0, 0.2)',
                  },
                },
                '&:nth-of-type(even)': {
                  bgcolor: 'rgba(248, 250, 252, 0.5)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 149, 0, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 149, 0, 0.12)',
                  },
                },
              },
              "& .MuiDataGrid-toolbarContainer": {
                padding: '20px 24px',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                '& .MuiButton-root': {
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                },
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                  bgcolor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '20px 24px',
                minHeight: '64px',
              },
              "& .MuiTablePagination-root": {
                color: '#64748b',
                minHeight: '64px',
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontWeight: 500,
                fontSize: '0.875rem',
              },
              "& .MuiTablePagination-select": {
                fontSize: '0.875rem',
              },
              "& .MuiTablePagination-actions": {
                '& .MuiIconButton-root': {
                  padding: '8px',
                  margin: '0 2px',
                },
              },
              "& .MuiDataGrid-overlay": {
                background: 'rgba(248, 250, 252, 0.9)',
                backdropFilter: 'blur(4px)',
              },
            }}
          />
        </Box>
      </EnhancedTableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            minWidth: 220,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <MenuItem onClick={() => {
          openDialog(selectedOrder, 'view');
          handleMenuClose();
        }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" sx={{ color: 'info.main' }} />
          </ListItemIcon>
          <ListItemText 
            primary={t("viewDetails") || "View Details"}
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
          />
        </MenuItem>
        
        {selectedOrder?.status === 'submitted' && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => handleApprove(selectedOrder)} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <ApproveIcon fontSize="small" sx={{ color: 'success.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary={t("approve") || "Approve"}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: 'success.main' }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleReject(selectedOrder)} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <RejectIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText 
                primary={t("reject") || "Reject"}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: 'error.main' }}
              />
            </MenuItem>
          </>
        )}
        
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => {
          handleDelete(selectedOrder);
          handleMenuClose();
        }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText 
            primary={t("delete") || "Delete"}
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: 'error.main' }}
          />
        </MenuItem>
      </Menu>

      {/* Order Dialog */}
      {dialog && (
        <OrderDialog
          dialog={dialog}
          onClose={closeDialog}
          onApproved={fetchOrders}
          language={i18n.language}
        />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t("confirmDeleteOrder") || "Delete Order"}
        message={
          deleteDialog.order 
            ? `${t("confirmDeleteOrderMessage") || "Are you sure you want to delete order"} #${deleteDialog.order.orderId}? ${t("actionCannotBeUndone") || "This action cannot be undone."}`
            : ""
        }
        confirmText={t("delete") || "Delete"}
        cancelText={t("cancel") || "Cancel"}
        type="error"
        severity="high"
      />
    </AdminLayout>
  );
}