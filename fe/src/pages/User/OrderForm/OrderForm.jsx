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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepButton,
  Fade,
  Slide,
  Collapse,
  IconButton,
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
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Approval as ApprovalIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import { orderApi, userApi, orderWindowApi } from "services/api";
import { WsContext } from "context/WsContext";
import { useCart } from "context/CartContext/useCart";

import UploadSignedDialog from "components/dialogs/UploadSignedDialog";
import OrderProgress from "components/indicators/OrderProgress";
import { useOrderExport } from "./useOrderExport";
import { useTranslation } from "react-i18next";
import { getProductImageUrl } from "utils/apiUtils";



export default function OrderForm() {
  console.log('🔍 ORDER_FORM: Component mounting...');
  console.log('🔍 ORDER_FORM: Auth state on mount:', localStorage.getItem('user') ? 'Authenticated' : 'Not authenticated');
  
  const [user, setUser] = useState(null);
  const [dept, setDept] = useState("");
  const [canOrder, setCanOrder] = useState(true);
  const [order, setOrder] = useState(null);
  const [upOpen, setUpOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Enhanced Stepper State
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepperExpanded, setStepperExpanded] = useState(true);

  const { subscribe } = useContext(WsContext);
  const { items, clear, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation('orders');

  const { exportPDF, markSubmitted } = useOrderExport(order, setOrder);

  // Enhanced Order Flow Steps Configuration with translations
  const ORDER_STEPS = [
    {
      id: 'cart',
      label: t('steps.cart.title'),
      description: t('steps.cart.description'),
      icon: <ShoppingCartIcon />,
      status: null, // Always available when items exist
    },
    {
      id: 'create',
      label: t('steps.create.title'),
      description: t('steps.create.description'),
      icon: <AssignmentIcon />,
      status: null, // Available when cart has items
    },
    {
      id: 'export',
      label: t('steps.export.title'),
      description: t('steps.export.description'),
      icon: <DescriptionIcon />,
      status: 'pending', // Available when order is created
    },
    {
      id: 'upload',
      label: t('steps.upload.title'),
      description: t('steps.upload.description'),
      icon: <CloudUploadIcon />,
      status: 'exported', // Available when PDF is exported
    },
    {
      id: 'submit',
      label: t('steps.submit.title'),
      description: t('steps.submit.description'),
      icon: <SendIcon />,
      status: 'uploaded', // Available when signed PDF is uploaded
    },
    {
      id: 'approval',
      label: t('steps.approval.title'),
      description: t('steps.approval.description'),
      icon: <ApprovalIcon />,
      status: 'submitted', // Available when order is submitted
    },
  ];

  // Order status mapping for better UX with translations
  const ORDER_STATUS_CONFIG = {
    pending: {
      label: t('status.orderCreated'),
      color: "info",
      progress: 20,
      step: 2,
      description: t('status.orderCreatedDescription')
    },
    exported: {
      label: t('status.pdfExported'),
      color: "warning", 
      progress: 40,
      step: 3,
      description: t('status.pdfExportedDescription')
    },
    uploaded: {
      label: t('status.signedPdfUploaded'),
      color: "secondary",
      progress: 60,
      step: 4,
      description: t('status.signedPdfUploadedDescription')
    },
    submitted: {
      label: t('status.submittedForApproval'),
      color: "primary",
      progress: 80,
      step: 5,
      description: t('status.submittedForApprovalDescription')
    },
    approved: {
      label: t('status.approved'),
      color: "success",
      progress: 100,
      step: 5,
      description: t('status.approvedDescription')
    },
    rejected: {
      label: t('status.rejected'),
      color: "error",
      progress: 100,
      step: 5,
      description: t('status.rejectedDescription')
    }
  };

  // Calculate current step based on order status and cart state
  const getCurrentStep = () => {
    if (!items.length) return 0; // Cart step
    if (!order) return 1; // Create order step
    if (order.status === 'pending') return 2; // Export PDF step
    if (order.status === 'exported') return 3; // Upload signed PDF step
    if (order.status === 'uploaded') return 4; // Submit order step
    if (['submitted', 'approved', 'rejected'].includes(order.status)) return 5; // Approval step
    return 1;
  };

  // Update active step when order status changes
  useEffect(() => {
    const newStep = getCurrentStep();
    setActiveStep(newStep);
    
    // Mark previous steps as completed
    const completed = new Set();
    for (let i = 0; i < newStep; i++) {
      completed.add(i);
    }
    setCompletedSteps(completed);
  }, [order, items.length]);

  useEffect(() => {
    console.log('🔍 ORDER_FORM: fetchUserData useEffect triggered');
    
    const fetchUserData = async () => {
      try {
        console.log('🔍 ORDER_FORM: Starting fetchUserData...');
        
        // Check if user is authenticated before making API call
        const storedUser = localStorage.getItem('user');
        console.log('🔍 ORDER_FORM: Stored user check:', storedUser ? 'Found' : 'Not found');
        
        if (!storedUser) {
          console.warn("🔍 ORDER_FORM: No stored user found, using fallback");
          setDept(t('labels.guestUser'));
          setUser({ username: t('labels.guest'), departmentName: t('labels.guestUser') });
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        console.log('🔍 ORDER_FORM: Parsed user:', parsedUser);
        
        // Set fallback user info immediately from stored data
        const fallbackUser = {
          username: parsedUser?.username || t('labels.user'),
          departmentName: parsedUser?.departmentName || parsedUser?.department?.name || t('labels.unknownDepartment')
        };
        setUser(fallbackUser);
        setDept(fallbackUser.departmentName);
        
        console.log('🔍 ORDER_FORM: Fallback user set:', fallbackUser);
        
        if (!parsedUser?.token) {
          console.warn("🔍 ORDER_FORM: No token found, using fallback data only");
          return;
        }

        console.log("🔍 ORDER_FORM: Attempting to fetch fresh user info...");
        
        // Try to get fresh user info, but don't fail if it doesn't work
        try {
          const userResponse = await userApi.getUserInfo();
          console.log("🔍 ORDER_FORM: Fresh user response:", userResponse);
          
          // Update with fresh data if successful
          setUser(userResponse);
          
          // Enhanced department name resolution
          const departmentName = userResponse?.departmentName || 
                                userResponse?.department?.name || 
                                userResponse?.department?.departmentName ||
                                userResponse?.dept?.name ||
                                parsedUser?.departmentName ||
                                t('labels.unknownDepartment');
          console.log("🔍 ORDER_FORM: Fresh department resolved:", departmentName);
          setDept(departmentName);
        } catch (freshDataError) {
          console.warn("🔍 ORDER_FORM: Fresh user info failed, using fallback data:", freshDataError.message);
          // Keep the fallback data we already set - don't show error to user
          // The order form can still function with basic user info
        }
      } catch (error) {
        console.error("🔍 ORDER_FORM: Critical user data error:", error);
        
        // Set minimal fallback data to keep the form functional
        setUser({ username: t('labels.user'), departmentName: t('labels.unknownDepartment') });
        setDept(t('labels.unknownDepartment'));
        
        // Only show error for non-auth issues
        if (error.response?.status !== 401) {
          console.warn("🔍 ORDER_FORM: Showing user info error toast");
          toast.warning(t('messages.userInfoLoadError'));
        }
      }
    };

    const fetchOrderWindow = async () => {
      try {
        console.log('🔍 ORDER_FORM: Checking order window status...');
        const windowResponse = await orderWindowApi.check();
        console.log('🔍 ORDER_FORM: Order window response:', windowResponse);
        setCanOrder(windowResponse?.canOrder ?? windowResponse?.open ?? true);
      } catch (error) {
        console.warn("🔍 ORDER_FORM: Order window check failed:", error.message);
        // Default to allowing orders if check fails
        setCanOrder(true);
      }
    };

    // Stagger the API calls to avoid overwhelming the server
    const timer = setTimeout(async () => {
      // Run both calls concurrently but handle failures independently
      await Promise.allSettled([
        fetchUserData(),
        fetchOrderWindow()
      ]);
    }, 100); // Reduced delay since we're handling failures better

    return () => clearTimeout(timer);
  }, [t]);

  useEffect(() => {
    let off;
    subscribe("/topic/order-window", ({ open }) => {
      setCanOrder(open);
      toast.info(open ? `✅ ${t('messages.windowOpen')}` : `⏰ ${t('messages.windowClosed')}`);
    }).then((o) => (off = o));
    return () => off && off();
  }, [subscribe]);

  const handleSubmit = async () => {
    if (!canOrder) {
      toast.warning(t('messages.orderWindowClosed'));
      return;
    }

    if (!items.length) {
      toast.error(t('messages.noItemsInCart'));
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
      toast.success(t('messages.orderCreatedSuccess'));
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
      toast.success(t('messages.pdfExportedSuccess'));
    } catch (e) {
      toast.error(t('messages.failedToExportPdf'));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSigned = () => {
    setUpOpen(true);
  };

  const handleSubmitOrder = async () => {
    if (!order) {
      toast.error(t('messages.noOrderToSubmit'));
      return;
    }

    setLoading(true);
    try {
      // Call the API to submit the order (change status from 'uploaded' to 'submitted')
      await orderApi.confirm(order.id || order.orderId);
      
      // Update local order state
      setOrder(prev => ({ ...prev, status: 'submitted' }));
      
      toast.success(t('messages.orderSubmittedSuccess'));
    } catch (error) {
      console.error('Submit order error:', error);
      toast.error(error.response?.data?.message || t('messages.failedToSubmitOrder'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (order && order.status !== 'approved' && order.status !== 'rejected') {
      if (window.confirm(t('messages.confirmGoBack'))) {
        setOrder(null);
      }
    } else {
      setOrder(null);
    }
  };

  const handleCancelOrder = () => {
    if (window.confirm(t('messages.confirmCancelOrder'))) {
      setOrder(null);
      toast.info(t('messages.orderCancelled'));
    }
  };

  const today = new Date().toLocaleDateString();

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Enhanced Header with Stepper Toggle */}
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
            📋 {t('form.title')}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
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
            
            <IconButton
              onClick={() => setStepperExpanded(!stepperExpanded)}
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              {stepperExpanded ? <ArrowBackIcon /> : <ArrowForwardIcon />}
            </IconButton>
          </Stack>
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
                🏢 {t('labels.department')}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {dept || t('ui.loading')}
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
                👤 {t('labels.username')}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {user?.username || t('ui.loading')}
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
                📅 {t('labels.date')}
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
            ⚠️ {t('messages.orderWindowClosed')}
          </Alert>
        )}
      </Paper>

      {/* Enhanced Integrated Stepper */}
      <Collapse in={stepperExpanded}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '2px solid',
            borderColor: 'primary.light',
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600} color="primary.main" sx={{ mb: 3 }}>
            🚀 {t('form.orderProgressStepper')}
          </Typography>
          
          <Stepper 
            activeStep={activeStep} 
            orientation="horizontal"
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'success.main',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'primary.main',
              },
            }}
          >
            {ORDER_STEPS.map((step, index) => (
              <Step key={step.id} completed={completedSteps.has(index)}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: completed 
                          ? 'success.main' 
                          : active 
                            ? 'primary.main' 
                            : 'grey.300',
                        color: 'white',
                        transition: 'all 0.3s ease-in-out',
                        transform: active ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: active ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                      }}
                    >
                      {completed ? <CheckCircleIcon /> : step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step-specific Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                bgcolor: 'rgba(0,0,0,0.8)', 
                color: 'white', 
                p: 1, 
                borderRadius: 1,
                fontSize: '0.8rem',
                fontFamily: 'monospace'
              }}>
                <div>activeStep: {activeStep}</div>
                <div>order: {order ? 'exists' : 'null'}</div>
                <div>order.status: {order?.status || 'undefined'}</div>
                <div>items.length: {items.length}</div>
                <div>canOrder: {canOrder ? 'true' : 'false'}</div>
              </Box>
            )}
            {activeStep === 0 && items.length === 0 && (
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate("/products")}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white !important",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t('actions.startShopping')}
              </Button>
            )}

            {activeStep === 1 && items.length > 0 && !order && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AssignmentIcon />}
                onClick={handleSubmit}
                disabled={!canOrder || loading}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white !important",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t('actions.createOrder')}
              </Button>
            )}

            {activeStep === 2 && order?.status === "pending" && (
              <Button
                variant="contained"
                size="large"
                startIcon={<DescriptionIcon />}
                onClick={handleExportPDF}
                disabled={loading}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  color: "white !important",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t('actions.exportPDF')}
              </Button>
            )}

            {/* Debug: Show Export PDF button with conditions */}
            {process.env.NODE_ENV === 'development' && order && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,193,7,0.1)', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Debug: Export PDF Button Conditions
                </Typography>
                <Typography variant="body2">
                  activeStep === 2: {activeStep === 2 ? '✅' : '❌'} (current: {activeStep})
                </Typography>
                <Typography variant="body2">
                  order exists: {order ? '✅' : '❌'}
                </Typography>
                <Typography variant="body2">
                  order.status === "pending": {order?.status === "pending" ? '✅' : '❌'} (current: {order?.status})
                </Typography>
                {order?.status === "pending" && activeStep === 2 && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DescriptionIcon />}
                    onClick={handleExportPDF}
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    Debug Export PDF
                  </Button>
                )}
              </Box>
            )}

            {activeStep === 3 && order?.status === "exported" && (
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadSigned}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                  color: "white !important",
                  "&:hover": {
                    background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t('actions.uploadSignedPdf')}
              </Button>
            )}

            {activeStep === 4 && order?.status === "uploaded" && (
              <Button
                variant="contained"
                size="large"
                startIcon={<SendIcon />}
                onClick={handleSubmitOrder}
                disabled={loading}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)",
                  color: "white !important",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7b1fa2 0%, #512da8 100%)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)",
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              >
                {loading ? t('ui.submitting') : t('actions.submitOrderToAdmin')}
              </Button>
            )}

            {activeStep === 5 && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate("/order-history")}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white !important",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {t('actions.viewOrderHistory')}
                </Button>
                
                {order?.status === 'approved' && (
                  <Chip
                    label={`✅ ${t('status.orderApproved')}`}
                    color="success"
                    variant="filled"
                    sx={{ 
                      py: 2,
                      px: 2,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      </Collapse>

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
            🚀 {t('form.orderProgress')}
          </Typography>
          <OrderProgress status={order.status} />
          
          {/* Flow Instructions */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
              📋 {t('form.nextSteps')}:
            </Typography>
            {order.status === "pending" && (
              <>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {t('instructions.exportPdfSteps')}
                </Typography>
                
                {/* Export PDF Button in Order Progress Section */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DescriptionIcon />}
                    onClick={handleExportPDF}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                      color: "white !important",
                      "&:hover": {
                        background: "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)",
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  >
                    {loading ? t('ui.exporting') : `📄 ${t('actions.exportPDF')}`}
                  </Button>
                </Box>
              </>
            )}
            {order.status === "exported" && (
              <Typography variant="body1" color="text.secondary">
                {t('instructions.uploadSignedSteps')}
              </Typography>
            )}
            {order.status === "submitted" && (
              <Typography variant="body1" color="text.secondary">
                {t('instructions.submittedSteps')}
              </Typography>
            )}
            {order.status === "approved" && (
              <Typography variant="body1" color="success.main">
                {t('instructions.approvedMessage')}
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
                    {t('table.productName')}
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
                    {t('table.quantity')}
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
                    {t('table.unit')}
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
                            ? getProductImageUrl(product.image)
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
                              {t('table.itemNumber', { number: index + 1 })}
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

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
          🔗 {t('form.quickActions')}
        </Typography>
        
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate("/products")}
            sx={{ 
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": { borderWidth: 2 }
            }}
          >
            🛍️ {t('cart.continueShopping') || 'Continue Shopping'}
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
            onClick={() => navigate("/order-history")}
            sx={{ 
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": { borderWidth: 2 }
            }}
          >
            📋 {t('order.orderHistory') || 'Order History'}
          </Button>

          {order && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ 
                fontWeight: 600,
                borderWidth: 2,
                "&:hover": { borderWidth: 2 }
              }}
            >
              🔄 {t('actions.refreshStatus')}
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Upload Dialog */}
      {order && (
        <UploadSignedDialog
          open={upOpen}
          order={order}
          onClose={() => setUpOpen(false)}
          onUpload={async (file) => {
            try {
              // Create FormData for file upload
              const formData = new FormData();
              formData.append('file', file);
              
              // Upload the signed PDF
              const orderId = order.orderId || order.id;
              await orderApi.uploadSignedPdf(orderId, formData);
              
              // Update order status to 'uploaded'
              setOrder(prev => ({ ...prev, status: 'uploaded' }));
              setUpOpen(false);
              toast.success(t('messages.signedPdfUploaded') || 'Signed PDF uploaded successfully! You can now submit your order to admin.');
            } catch (error) {
              console.error('Upload error:', error);
              toast.error(t('messages.uploadFailed', { error: error.message }));
              throw error; // Re-throw so the dialog can handle it
            }
          }}
        />
      )}
    </Box>
  );
}