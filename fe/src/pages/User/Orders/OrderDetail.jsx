import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Avatar,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PictureAsPdf as PictureAsPdfIcon,
  CloudUpload as CloudUploadIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { orderApi } from "services/api";
import { useTranslation } from "react-i18next";
import OrderProgress from "components/indicators/OrderProgress";
import LoadingSpinner from "components/common/LoadingSpinner";
import UploadSignedDialog from "components/dialogs/UploadSignedDialog";
import { getProductImageUrl } from "utils/apiUtils";

export default function OrderDetail() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upOpen, setUpOpen] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 OrderDetail: Fetching details for order ID:', orderId);
        
        // Fetch order details and items in parallel
        const [orderResponse, itemsResponse] = await Promise.all([
          orderApi.detail(orderId),
          orderApi.getItems(orderId)
        ]);
        
        console.log('🔍 OrderDetail: Order details response:', orderResponse);
        console.log('🔍 OrderDetail: Order items response:', itemsResponse);
        
        setOrder(orderResponse);
        setOrderItems(Array.isArray(itemsResponse) ? itemsResponse : []);
        
      } catch (err) {
        console.error('❌ OrderDetail: Error fetching order details:', err);
        console.error('❌ OrderDetail: Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(err.message || 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      console.log('🔍 OrderDetail: Starting fetch for order ID:', orderId);
      fetchOrderDetails();
    } else {
      console.warn('⚠️ OrderDetail: No order ID provided');
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const handleExportPDF = async () => {
    try {
      const response = await orderApi.export(orderId);
      
      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully!');
      
      // Update order status
      setOrder(prev => ({ ...prev, status: 'exported' }));
      
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export PDF');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { color: "info", icon: <HourglassEmptyIcon />, label: "Order Created" };
      case "exported":
        return { color: "warning", icon: <PictureAsPdfIcon />, label: "PDF Exported" };
      case "uploaded":
        return { color: "secondary", icon: <CloudUploadIcon />, label: "Signed PDF Uploaded" };
      case "submitted":
        return { color: "primary", icon: <SendIcon />, label: "Submitted for Approval" };
      case "approved":
        return { color: "success", icon: <CheckCircleIcon />, label: "Approved" };
      case "rejected":
        return { color: "error", icon: <CancelIcon />, label: "Rejected" };
      default:
        return { color: "default", icon: <AssignmentIcon />, label: status || "Unknown" };
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/order-history')}
          sx={{ mt: 2 }}
        >
          Back to Order History
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 3 }}>
          Order not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/order-history')}
          sx={{ mt: 2 }}
        >
          Back to Order History
        </Button>
      </Container>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate('/order-history')}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Order #{order.orderId || order.id}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {order.orderNumber || `ORD-${order.orderId || order.id}`}
              </Typography>
            </Box>
          </Stack>
          
          <Stack alignItems="flex-end" spacing={1}>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Created {formatDate(order.createdAt)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Order Progress */}
      <Box sx={{ mb: 3 }}>
        <OrderProgress status={order.status} />
      </Box>

      <Grid container spacing={3}>
        {/* Order Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📋 Order Information
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ScheduleIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(order.createdAt)}
                  </Typography>
                </Box>
              </Stack>

              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ScheduleIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(order.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              )}

              {order.createdBy && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PersonIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {order.createdBy.username || order.createdBy}
                    </Typography>
                  </Box>
                </Stack>
              )}

              {order.department && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <BusinessIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {order.department.name || order.departmentName}
                    </Typography>
                  </Box>
                </Stack>
              )}

              <Stack direction="row" alignItems="center" spacing={2}>
                <AssignmentIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Items
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {orderItems.length} items
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* Admin Comment */}
            {order.adminComment && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Admin Comment:
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  "{order.adminComment}"
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Stack spacing={2} sx={{ mt: 3 }}>
              {order.status === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportPDF}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Export PDF
                </Button>
              )}

              {order.status === 'exported' && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setUpOpen(true)}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                    }
                  }}
                >
                  Upload Signed PDF
                </Button>
              )}

              {order.status === 'uploaded' && (
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={async () => {
                    try {
                      await orderApi.confirm(order.orderId || order.id);
                      setOrder(prev => ({ ...prev, status: 'submitted' }));
                      toast.success('Order submitted successfully!');
                    } catch (error) {
                      toast.error('Failed to submit order');
                    }
                  }}
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7b1fa2 0%, #512da8 100%)",
                    }
                  }}
                >
                  Submit Order to Admin
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/order-form')}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Continue in Order Form
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Print Order
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📦 Order Items ({orderItems.length})
            </Typography>
            
            {orderItems.length === 0 ? (
              <Alert severity="info">
                No items found for this order.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow key={item.orderItemId || index} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              src={item.productImage ? getProductImageUrl(item.productImage) : '/placeholder-prod.png'}
                              alt={item.productName}
                              sx={{ width: 48, height: 48 }}
                              variant="rounded"
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.productName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Code: {item.productCode || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.quantity}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {item.unitNameEn || item.unitNameVn || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      {order && (
        <UploadSignedDialog
          open={upOpen}
          order={order}
          onClose={() => setUpOpen(false)}
          onUpload={async (file) => {
            try {
              const formData = new FormData();
              formData.append('file', file);
              const orderId = order.orderId || order.id;
              await orderApi.uploadSignedPdf(orderId, formData);
              setOrder(prev => ({ ...prev, status: 'uploaded' }));
              setUpOpen(false);
              toast.success('Signed PDF uploaded successfully!');
            } catch (error) {
              console.error('Upload error:', error);
              toast.error(`Upload failed: ${error.message}`);
              throw error;
            }
          }}
        />
      )}
    </Container>
  );
}