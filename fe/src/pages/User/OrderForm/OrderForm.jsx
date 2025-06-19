// src/pages/User/OrderForm/OrderForm.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import { orderApi, userApi, orderWindowApi } from "services/api";
import { WsContext } from "context/WsContext";
import { useCart } from "context/CartContext/useCart";

import UploadSignedDialog from "components/dialogs/UploadSignedDialog";
import OrderProgress from "components/indicators/OrderProgress";
import { useOrderExport } from "./useOrderExport";
import { useTranslation } from "react-i18next";

// Order status mapping for better UX
const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Order Created",
    color: "info",
    progress: 25,
    description: "Your order has been created and is ready for PDF export"
  },
  exported: {
    label: "PDF Exported",
    color: "warning", 
    progress: 50,
    description: "PDF has been exported. Please get it signed and upload back"
  },
  submitted: {
    label: "Submitted for Approval",
    color: "primary",
    progress: 75,
    description: "Signed PDF uploaded. Waiting for admin approval"
  },
  approved: {
    label: "Approved",
    color: "success",
    progress: 100,
    description: "Your order has been approved and will be processed"
  },
  rejected: {
    label: "Rejected",
    color: "error",
    progress: 100,
    description: "Your order has been rejected. Please check admin comments"
  }
};

export default function OrderForm() {
  const [user, setUser] = useState(null);
  const [dept, setDept] = useState("");
  const [canOrder, setCanOrder] = useState(true);
  const [order, setOrder] = useState(null);
  const [upOpen, setUpOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { subscribe } = useContext(WsContext);
  const { items, clear, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { exportPDF, markSubmitted } = useOrderExport(order, setOrder);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await userApi.getUserInfo();
        console.log("User response:", userResponse);
        setUser(userResponse);
        
        // Enhanced department name resolution
        const departmentName = userResponse?.departmentName || 
                              userResponse?.department?.name || 
                              userResponse?.department?.departmentName ||
                              userResponse?.dept?.name ||
                              "Unknown Department";
        setDept(departmentName);
      } catch (error) {
        console.error("User info error:", error);
        toast.error(t('messages.userInfoError') || 'Failed to load user information');
        setDept("Unknown Department");
      }
    };

    const fetchOrderWindow = async () => {
      try {
        const windowResponse = await orderWindowApi.check();
        setCanOrder(windowResponse?.canOrder ?? windowResponse?.open ?? true);
      } catch (error) {
        console.warn("Failed to check order window status:", error);
        setCanOrder(true);
      }
    };

    fetchUserData();
    fetchOrderWindow();
  }, [t]);

  useEffect(() => {
    let off;
    subscribe("/topic/order-window", ({ open }) => {
      setCanOrder(open);
      toast.info(open ? "✅ Window OPEN" : "⏰ Window CLOSED");
    }).then((o) => (off = o));
    return () => off && off();
  }, [subscribe]);

  const handleSubmit = async () => {
    if (!canOrder) {
      toast.warning(t('messages.orderWindowClosed') || 'Order window is currently closed');
      return;
    }

    if (!items.length) {
      toast.error(t('messages.noItemsInCart') || 'No items in cart');
      return;
    }

    setLoading(true);
    try {
      const response = await orderApi.create({
        items: items.map((item) => ({ 
          productId: item.product.id || item.product.productId, 
          quantity: item.qty 
        })),
      });
      console.log("Order created:", response);
      setOrder(response);
      clear(); // Clear cart after successful order creation
      toast.success(t('messages.orderCreatedSuccess') || 'Order created successfully! Please export PDF for signature.');
    } catch (e) {
      console.error("Order creation error:", e);
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await exportPDF();
      toast.success(t('messages.pdfExportedSuccess') || 'PDF exported successfully! Please get it signed and upload back.');
    } catch (e) {
      toast.error(t('messages.failedToExportPdf') || 'Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSigned = () => {
    setUpOpen(true);
  };

  const handleSubmitOrder = async () => {
    try {
      toast.success(t('messages.orderSubmittedSuccess') || 'Order submitted successfully! Redirecting to order history...');
      setTimeout(() => navigate("/order-history"), 1500);
    } catch (e) {
      toast.error(t('messages.failedToSubmitOrder') || 'Failed to submit order');
    }
  };

  const handleGoBack = () => {
    if (order && order.status !== 'approved' && order.status !== 'rejected') {
      if (window.confirm('Are you sure you want to go back? Your current order progress will be lost.')) {
        setOrder(null);
      }
    } else {
      setOrder(null);
    }
  };

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      setOrder(null);
      toast.info('Order cancelled');
    }
  };

  const today = new Date().toLocaleDateString();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Header */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h3" fontWeight={700}>
            📋 {t('order.orderForm') || 'Order Form'}
          </Typography>
          
          {order && (
            <Chip
              label={ORDER_STATUS_CONFIG[order.status]?.label || order.status}
              color={ORDER_STATUS_CONFIG[order.status]?.color || 'default'}
              variant="filled"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
          )}
        </Stack>
        
        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: "rgba(255,255,255,0.1)", 
              p: 3, 
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              height: '100%',
            }}>
              <Typography variant="h6" gutterBottom>
                🏢 Department
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {dept || "Loading..."}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: "rgba(255,255,255,0.1)", 
              p: 3, 
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              height: '100%',
            }}>
              <Typography variant="h6" gutterBottom>
                👤 Username
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user?.username || "Loading..."}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              bgcolor: "rgba(255,255,255,0.1)", 
              p: 3, 
              borderRadius: 2,
              backdropFilter: "blur(10px)",
              height: '100%',
            }}>
              <Typography variant="h6" gutterBottom>
                📅 Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {today}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {!canOrder && (
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 2,
              bgcolor: "rgba(255,193,7,0.1)",
              color: "white",
              "& .MuiAlert-icon": { color: "#ffc107" }
            }}
          >
            ⚠️ {t('messages.orderWindowClosed') || 'Order window is currently closed'}
          </Alert>
        )}
      </Paper>

      {/* Order Progress */}
      {order && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600} color="success.main">
            🚀 {t('order.orderProgress') || 'Order Progress'}
          </Typography>
          <OrderProgress status={order.status} />
          
          {/* Flow Instructions */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
              📋 Next Steps:
            </Typography>
            {order.status === "pending" && (
              <Typography variant="body1" color="text.secondary">
                1. Click "Export PDF" to download your order form<br/>
                2. Get it signed by your department head<br/>
                3. Upload the signed PDF back to the system
              </Typography>
            )}
            {order.status === "exported" && (
              <Typography variant="body1" color="text.secondary">
                1. ✅ PDF exported successfully<br/>
                2. Get the PDF signed by your department head<br/>
                3. Click "Upload Signed PDF" to submit your order
              </Typography>
            )}
            {order.status === "submitted" && (
              <Typography variant="body1" color="text.secondary">
                1. ✅ PDF exported<br/>
                2. ✅ Signed PDF uploaded<br/>
                3. ⏳ Waiting for admin approval
              </Typography>
            )}
            {order.status === "approved" && (
              <Typography variant="body1" color="success.main">
                🎉 Your order has been approved and will be processed!
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Order Items */}
      <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
          📦 {t('order.orderItems') || 'Order Items'}
        </Typography>
        
        {items.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h2" sx={{ opacity: 0.3, mb: 2 }}>🛒</Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('cart.emptyCart') || 'Your cart is empty'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate("/products")}
              sx={{ mt: 2 }}
            >
              {t('messages.startShopping') || 'Start Shopping'}
            </Button>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: "1rem",
                      bgcolor: "#f5f5f5",
                      width: "50%",
                      textAlign: "left"
                    }}
                  >
                    Product Name
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: "1rem",
                      bgcolor: "#f5f5f5",
                      width: "25%",
                      textAlign: "center"
                    }}
                  >
                    Quantity
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: "1rem",
                      bgcolor: "#f5f5f5",
                      width: "25%",
                      textAlign: "center"
                    }}
                  >
                    Unit
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const product = item.product;
                  const unitLabel = typeof product.unit === "object" && product.unit !== null
                    ? product.unit.name || product.unit.nameVn
                    : product.unit || "N/A";

                  return (
                    <TableRow 
                      key={product.id || index}
                      sx={{ 
                        "&:nth-of-type(odd)": { bgcolor: "#fafafa" },
                        "&:hover": { bgcolor: "#f0f0f0" },
                        transition: "background-color 0.2s"
                      }}
                    >
                      <TableCell sx={{ width: "50%" }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            component="img"
                            src={product?.image 
                              ? `/uploads/product-img/${product.image}` 
                              : "/placeholder-prod.png"}
                            alt={product.name}
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              objectFit: "cover", 
                              borderRadius: 2,
                              border: "2px solid #e0e0e0",
                              flexShrink: 0
                            }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Item #{index + 1}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ width: "25%" }}>
                        <Box sx={{ 
                          bgcolor: "primary.main", 
                          color: "white", 
                          borderRadius: "50%", 
                          width: 40, 
                          height: 40, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          mx: "auto",
                          fontWeight: 600
                        }}>
                          {item.qty}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ width: "25%" }}>
                        <Typography variant="body1" fontWeight={500}>
                          {unitLabel}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Buttons */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
          ⚡ Actions
        </Typography>
        
        {/* Step-by-step Action Flow */}
        <Box sx={{ mb: 3 }}>
          {!order && (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'primary.light', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
                Step 1: Create Your Order
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Review your items and create the order to begin the approval process
              </Typography>
              <Button
                variant="contained"
                size="large"
                disabled={!items.length || !canOrder}
                onClick={handleSubmit}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                  "&:disabled": {
                    bgcolor: "rgba(255,255,255,0.3)",
                    color: "rgba(255,255,255,0.5)"
                  }
                }}
              >
                🚀 {t('order.createOrder') || 'Create Order'}
              </Button>
            </Box>
          )}

          {order?.status === "pending" && (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'info.light', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
                Step 2: Export PDF for Signature
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Download the order form PDF and get it signed by your department head
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleExportPDF}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  bgcolor: "white",
                  color: "info.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  }
                }}
              >
                📄 {t('order.exportPDF') || 'Export PDF'}
              </Button>
            </Box>
          )}

          {order?.status === "exported" && (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'warning.light', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
                Step 3: Upload Signed PDF
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Upload the signed PDF to submit your order for admin approval
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleUploadSigned}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  bgcolor: "white",
                  color: "warning.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  }
                }}
              >
                📤 {t('order.uploadSigned') || 'Upload Signed PDF'}
              </Button>
            </Box>
          )}

          {order?.status === "submitted" && (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'success.light', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
                Step 4: Waiting for Admin Approval
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Your order has been submitted and is waiting for admin approval
              </Typography>
              <Button
                variant="contained"
                size="large"
                disabled
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  bgcolor: "white",
                  color: "success.main",
                }}
              >
                ⏳ {t('messages.waitingForAdminApproval') || 'Waiting for Admin Approval'}
              </Button>
            </Box>
          )}

          {order?.status === "approved" && (
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'success.main', borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
                ✅ Order Approved!
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)" sx={{ mb: 2 }}>
                Your order has been approved and will be processed
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/order-history")}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  bgcolor: "white",
                  color: "success.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  }
                }}
              >
                📋 View Order History
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="text"
            size="large"
            onClick={() => navigate("/products")}
            sx={{ fontWeight: 500 }}
          >
            🛍️ {t('cart.continueShopping') || 'Continue Shopping'}
          </Button>
          
          <Button
            variant="text"
            size="large"
            onClick={() => navigate("/order-history")}
            sx={{ fontWeight: 500 }}
          >
            📋 {t('order.orderHistory') || 'Order History'}
          </Button>
        </Stack>
      </Paper>

      {/* Upload Dialog */}
      {order && (
        <UploadSignedDialog
          open={upOpen}
          order={order}
          onClose={() => setUpOpen(false)}
          onDone={() => {
            markSubmitted();
            setUpOpen(false);
            toast.success(t('messages.signedPdfUploaded') || 'Signed PDF uploaded successfully');
          }}
        />
      )}
    </Box>
  );
}