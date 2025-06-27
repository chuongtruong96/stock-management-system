import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as OrderIcon,
  Business as DepartmentIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  FileDownload as DownloadIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Inventory as ProductIcon,
  Circle as CircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { orderApi } from 'services/api';
import { toast } from 'react-toastify';

const OrderDialog = ({ dialog, onClose, onApproved, language = "en" }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dialog?.order) {
      fetchOrderDetails();
    }
  }, [dialog?.order]);

  const fetchOrderDetails = async () => {
    if (!dialog?.order?.orderId) return;
    
    try {
      setLoading(true);
      const [detailsResponse, itemsResponse] = await Promise.all([
        orderApi.detail(dialog.order.orderId).catch(() => ({})),
        orderApi.getItems(dialog.order.orderId).catch(() => [])
      ]);
      
      setOrderDetails(detailsResponse || {});
      setOrderItems(Array.isArray(itemsResponse) ? itemsResponse : []);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order details');
      setOrderDetails({});
      setOrderItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'exported': return 'info';
      case 'submitted': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <PendingIcon />;
      case 'exported': return <DownloadIcon />;
      case 'submitted': return <UploadIcon />;
      case 'approved': return <CheckIcon />;
      case 'rejected': return <CancelIcon />;
      default: return <OrderIcon />;
    }
  };

  const orderSteps = [
    { 
      key: 'pending', 
      label: language === 'vi' ? 'Đang chờ' : 'Pending',
      description: language === 'vi' ? 'Đơn hàng đã được tạo' : 'Order has been created'
    },
    { 
      key: 'exported', 
      label: language === 'vi' ? 'Đã xuất PDF' : 'PDF Exported',
      description: language === 'vi' ? 'PDF đã được tạo và sẵn sàng ký' : 'PDF generated and ready for signing'
    },
    { 
      key: 'submitted', 
      label: language === 'vi' ? 'Đã nộp' : 'Submitted',
      description: language === 'vi' ? 'PDF đã ký và nộp lại' : 'Signed PDF submitted'
    },
    { 
      key: 'approved', 
      label: language === 'vi' ? 'Đã duyệt' : 'Approved',
      description: language === 'vi' ? 'Đơn hàng đã được phê duyệt' : 'Order has been approved'
    }
  ];

  const getCurrentStepIndex = () => {
    const status = dialog?.order?.status?.toLowerCase();
    if (status === 'rejected') return -1;
    return orderSteps.findIndex(step => step.key === status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '—';
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  if (!dialog?.open) return null;

  return (
    <Dialog
      open={dialog.open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      {/* Enhanced Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <OrderIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {language === 'vi' ? 'Chi tiết đơn hàng' : 'Order Details'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              #{dialog?.order?.orderId} • {dialog?.order?.orderNumber || 'N/A'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon(dialog?.order?.status)}
            label={dialog?.order?.status || 'Unknown'}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading order details...</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Left Column - Order Info & Progress */}
              <Grid item xs={12} md={6}>
                {/* Order Information Card */}
                <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OrderIcon color="primary" />
                      {language === 'vi' ? 'Thông tin đơn hàng' : 'Order Information'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {language === 'vi' ? 'Mã đơn hàng' : 'Order ID'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            #{dialog?.order?.orderId}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {language === 'vi' ? 'Số đơn hàng' : 'Order Number'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {dialog?.order?.orderNumber || '—'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {language === 'vi' ? 'Ngày tạo' : 'Created Date'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDate(dialog?.order?.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {language === 'vi' ? 'Cập nhật cuối' : 'Last Updated'}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDate(dialog?.order?.updatedAt)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Department & User Info */}
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DepartmentIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          {language === 'vi' ? 'Phòng ban' : 'Department'}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {dialog?.order?.departmentName || 'Unknown Department'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                          {language === 'vi' ? 'Người tạo' : 'Created By'}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {dialog?.order?.createdBy || 'Unknown User'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Progress Timeline */}
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DateIcon color="primary" />
                      {language === 'vi' ? 'Tiến trình đơn hàng' : 'Order Progress'}
                    </Typography>
                    
                    {/* Custom Timeline using Stepper */}
                    <Stepper 
                      activeStep={getCurrentStepIndex()} 
                      orientation="vertical"
                      sx={{ mt: 2 }}
                    >
                      {orderSteps.map((step, index) => {
                        const isActive = index <= getCurrentStepIndex();
                        const isCurrent = index === getCurrentStepIndex();
                        const isRejected = dialog?.order?.status?.toLowerCase() === 'rejected';
                        
                        return (
                          <Step key={step.key} completed={isActive && !isCurrent && !isRejected}>
                            <StepLabel
                              StepIconComponent={() => (
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: isActive && !isRejected ? 'primary.main' : 'grey.300',
                                    color: 'white',
                                    fontSize: '1rem'
                                  }}
                                >
                                  {isActive && !isRejected ? (
                                    isCurrent ? getStatusIcon(step.key) : <CheckIcon />
                                  ) : (
                                    <RadioButtonUncheckedIcon />
                                  )}
                                </Avatar>
                              )}
                            >
                              <Box sx={{ ml: 1 }}>
                                <Typography 
                                  variant="body1" 
                                  fontWeight={isCurrent && !isRejected ? 'bold' : 'medium'}
                                  color={isActive && !isRejected ? 'primary' : 'textSecondary'}
                                >
                                  {step.label}
                                  {isCurrent && !isRejected && (
                                    <Chip 
                                      label="Current" 
                                      size="small" 
                                      color="primary" 
                                      sx={{ ml: 1, height: 20 }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {step.description}
                                </Typography>
                              </Box>
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                    
                    {/* Rejected Status */}
                    {dialog?.order?.status?.toLowerCase() === 'rejected' && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: 'error.50', borderRadius: 2, border: '1px solid', borderColor: 'error.200' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                            <CancelIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold" color="error">
                              {language === 'vi' ? 'Đã từ chối' : 'Rejected'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {language === 'vi' ? 'Đơn hàng đã bị từ chối' : 'Order has been rejected'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Products & Comments */}
              <Grid item xs={12} md={6}>
                {/* Products Table */}
                <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ProductIcon color="primary" />
                        {language === 'vi' ? 'Sản phẩm đặt hàng' : 'Ordered Products'}
                      </Typography>
                      <Chip 
                        label={`${orderItems.length} ${language === 'vi' ? 'sản phẩm' : 'items'}`}
                        color="primary"
                        size="small"
                      />
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                              {language === 'vi' ? 'Sản phẩm' : 'Product'}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                              {language === 'vi' ? 'Số lượng' : 'Quantity'}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                              {language === 'vi' ? 'Đơn vị' : 'Unit'}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderItems.map((item, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {item.productName || 'Unknown Product'}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {item.productCode || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={item.quantity || 0}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {language === 'vi' ? item.unitNameVn : item.unitNameEn || '—'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Summary */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {language === 'vi' ? 'Tổng cộng' : 'Total'}: {calculateTotal()} {language === 'vi' ? 'sản phẩm' : 'items'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Comments & Notes */}
                {dialog?.order?.adminComment && (
                  <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CommentIcon color="primary" />
                        {language === 'vi' ? 'Ghi chú của Admin' : 'Admin Comments'}
                      </Typography>
                      
                      <Alert 
                        severity={dialog?.order?.status?.toLowerCase() === 'rejected' ? 'error' : 'info'}
                        sx={{ borderRadius: 2 }}
                      >
                        <Typography variant="body2">
                          {dialog?.order?.adminComment}
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2, px: 4 }}
        >
          {language === 'vi' ? 'Đóng' : 'Close'}
        </Button>
        
        {dialog?.mode === 'approve' && dialog?.order?.status === 'submitted' && (
          <>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckIcon />}
              onClick={() => {
                // Handle approve
                onApproved?.();
                onClose();
              }}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {language === 'vi' ? 'Phê duyệt' : 'Approve'}
            </Button>
            
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              onClick={() => {
                // Handle reject
                onClose();
              }}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {language === 'vi' ? 'Từ chối' : 'Reject'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderDialog;