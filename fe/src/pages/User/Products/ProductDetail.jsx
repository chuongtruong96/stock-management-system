import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Zoom,
  Fade,
  Alert,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogContent,
  Backdrop,
  useTheme,
  useMediaQuery,
  Container,
  Rating,
  Tooltip,
  Badge,
  Slide,
  Grow,
  Collapse,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ImageNotSupported as ImageNotSupportedIcon,
} from "@mui/icons-material";
import { useCart } from "../../../context/CartContext/useCart";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "services/api";
import { useTranslation } from "react-i18next";
import QuantitySelector from "components/shop/QuantitySelector";
import { toast } from "react-toastify";
import { getProductImageUrl } from "utils/apiUtils";
import RelatedProducts from "components/shop/RelatedProducts";

// Enhanced Image Component with better error handling and loading states
const ProductImage = ({ src, alt, onImageLoad, onImageError, t }) => {
  const [imageState, setImageState] = useState("loading"); // loading, loaded, error
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleImageLoad = useCallback(() => {
    setImageState("loaded");
    onImageLoad?.();
  }, [onImageLoad]);

  const handleImageError = useCallback(() => {
    setImageState("error");
    onImageError?.();
  }, [onImageError]);

  const fallbackImage = "/placeholder-prod.png";

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          bgcolor: "grey.50",
          width: "100%",
          height: { xs: 250, md: 400 }, // Fixed height for consistent sizing
          minHeight: { xs: 250, md: 400 }, // Ensure minimum height is maintained
          maxHeight: { xs: 250, md: 400 }, // Prevent height expansion
          cursor: imageState === "loaded" ? "zoom-in" : "default",
          transition: "all 0.3s ease-in-out",
          display: "flex", // Ensure container maintains structure
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            elevation: 8,
            transform: imageState === "loaded" ? "translateY(-4px)" : "none",
          },
        }}
        onClick={() => imageState === "loaded" && setImageZoomOpen(true)}
      >
        {/* Loading Skeleton */}
        {imageState === "loading" && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
            sx={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
          />
        )}

        {/* Error State */}
        {imageState === "error" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              color: "text.secondary",
              bgcolor: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
            >
              <ImageNotSupportedIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
              {t('details.noImageAvailable')}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 2 }}>
              {t('details.imageWillDisplay')}
            </Typography>
          </Box>
        )}

        {/* Main Image */}
        <Box
          component="img"
          src={src || fallbackImage}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="eager"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease-in-out",
            opacity: imageState === "loaded" ? 1 : 0,
            "&:hover": {
              transform: imageState === "loaded" ? "scale(1.02)" : "none",
            },
          }}
        />

        {/* Zoom Icon Overlay */}
        {imageState === "loaded" && (
          <Fade in timeout={300}>
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                bgcolor: "rgba(0, 0, 0, 0.7)",
                borderRadius: "50%",
                p: 1,
                color: "white",
                opacity: 0,
                transition: "opacity 0.3s ease-in-out",
                ".MuiPaper-root:hover &": {
                  opacity: 1,
                },
              }}
            >
              <ZoomInIcon fontSize="small" />
            </Box>
          </Fade>
        )}
      </Paper>

      {/* Image Zoom Dialog */}
      <Dialog
        open={imageZoomOpen}
        onClose={() => setImageZoomOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { bgcolor: "rgba(0, 0, 0, 0.9)" },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setImageZoomOpen(false)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              zIndex: 1,
              "&:hover": { bgcolor: "white" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={src || fallbackImage}
            alt={alt}
            loading="eager"
            sx={{
              width: "100%",
              height: "auto",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Enhanced Loading Component
const ProductDetailSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Skeleton variant="rectangular" width={120} height={40} sx={{ mb: 3 }} />
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={500}
          sx={{ borderRadius: 4 }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={3}>
          <Skeleton variant="text" width="80%" height={60} />
          <Stack direction="row" spacing={1}>
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width={120}
              height={32}
              sx={{ borderRadius: 2 }}
            />
          </Stack>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={120}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={60}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={150}
            sx={{ borderRadius: 3 }}
          />
        </Stack>
      </Grid>
    </Grid>
  </Container>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('products');
  const { addItem, isInCart, getCartItemQty } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [qty, setQty] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Use direct API call instead of useProducts hook
  const {
    data: product,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        const response = await productApi.byId(id);
        console.log("Product detail response:", response);
        return response;
      } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
    },
    enabled: !!id,
  });

  const productId = product?.productId || product?.id;
  const inCart = productId ? isInCart(productId) : false;
  const cartQty = productId ? getCartItemQty(productId) : 0;

  // Debug logging
  console.log("Debug Info:", {
    productId,
    inCart,
    cartQty,
    productData: product
  });

  useEffect(() => {
    if (product) {
      const productName = product.productName || product.name;
      document.title = `${productName} - Stationery Management`;
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product && !addingToCart) {
      setAddingToCart(true);
      try {
        const normalizedProduct = {
          id: product.productId || product.id,
          productId: product.productId || product.id,
          name: product.productName || product.name,
          productName: product.productName || product.name,
          unit: product.unit,
          unitName: product.unitName,
          image: product.image,
          description: product.description,
          available: product.available !== false,
        };

        addItem(normalizedProduct, qty);
        setQty(1);
        toast.success(
          t('cart.addedToCart'),
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      } catch (error) {
        toast.error(t('errors.addToCartError'));
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const productName = product.productName || product.name;
    const productDesc = product.description || `Check out ${productName}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: productDesc,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('sharing.linkCopied'));
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={300}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <WarningIcon sx={{ fontSize: 80, color: "error.main" }} />
            <Typography variant="h4" color="error.main" fontWeight={600}>
              {t('errors.notFound')}
            </Typography>
            <Alert severity="error" sx={{ maxWidth: 600 }}>
              {error?.message || t('errors.productNotFoundDescription')}
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                variant="outlined"
                size="large"
              >
                {t('actions.goBack')}
              </Button>
              <Button
                onClick={() => navigate("/products")}
                variant="contained"
                size="large"
              >
                {t('actions.browseProducts')}
              </Button>
            </Stack>
          </Stack>
        </Fade>
      </Container>
    );
  }

  const productName = product.productName || product.name || t('product.unknownProduct');
  const productDesc = product.description || "";
  const productCode = product.code || product.productCode || "";
  const unitLabel =
    typeof product.unit === "object" && product.unit !== null
      ? product.unit.unitName || product.unit.name || product.unit.nameVn
      : product.unitName || product.unit || "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
          pointerEvents: "none",
        },
        py: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '100%', mx: 'auto' }}>
        {/* Floating Navigation Bar */}
        <Slide direction="down" in timeout={800}>
          <Card
            elevation={24}
            sx={{
              position: "sticky",
              top: 20,
              zIndex: 1000,
              mb: 4,
              borderRadius: 6,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Box
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              {/* Enhanced Back Button */}
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 5,
                  px: 5,
                  py: 2,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white !important", // Force white text with !important
                  // Target specific elements to ensure white color
                  "& .MuiButton-startIcon": {
                    color: "white !important",
                  },
                  "& .MuiButton-label": {
                    color: "white !important",
                  },
                  "& span": {
                    color: "white !important",
                  },
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    transform: "translateX(-8px) translateY(-4px) scale(1.02)",
                    boxShadow: "0 16px 48px rgba(102, 126, 234, 0.6)",
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    color: "white !important", // Force white text on hover
                    "& .MuiButton-startIcon": {
                      color: "white !important",
                    },
                    "& .MuiButton-label": {
                      color: "white !important",
                    },
                    "& span": {
                      color: "white !important",
                    },
                  },
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                {t('actions.backToProducts')}
              </Button>

              {/* Floating Quick Actions Hub */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="text.primary"
                  sx={{
                    display: { xs: "none", md: "block" },
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t('actions.quickActions')}
                </Typography>

                <Stack direction="row" spacing={1.5}>
                  <Tooltip title={t('actions.continueShopping')} arrow>
                    <IconButton
                      onClick={() => navigate("/products")}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        width: 48,
                        height: 48,
                        boxShadow: "0 4px 16px rgba(25, 118, 210, 0.3)",
                        "&:hover": {
                          bgcolor: "primary.dark",
                          transform: "translateY(-4px) scale(1.1)",
                          boxShadow: "0 8px 24px rgba(25, 118, 210, 0.5)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <ShoppingCartIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('actions.viewCart')} arrow>
                    <Badge badgeContent={cartQty} color="error">
                      <IconButton
                        onClick={() => navigate("/order-form")}
                        sx={{
                          bgcolor: "success.main",
                          color: "white",
                          width: 48,
                          height: 48,
                          boxShadow: "0 4px 16px rgba(76, 175, 80, 0.3)",
                          "&:hover": {
                            bgcolor: "success.dark",
                            transform: "translateY(-4px) scale(1.1)",
                            boxShadow: "0 8px 24px rgba(76, 175, 80, 0.5)",
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        <LocalOfferIcon />
                      </IconButton>
                    </Badge>
                  </Tooltip>

                  <Tooltip title={t('actions.orderHistory')} arrow>
                    <IconButton
                      onClick={() => navigate("/order-history")}
                      sx={{
                        bgcolor: "secondary.main",
                        color: "white",
                        width: 48,
                        height: 48,
                        boxShadow: "0 4px 16px rgba(156, 39, 176, 0.3)",
                        "&:hover": {
                          bgcolor: "secondary.dark",
                          transform: "translateY(-4px) scale(1.1)",
                          boxShadow: "0 8px 24px rgba(156, 39, 176, 0.5)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <InventoryIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Box>
          </Card>
        </Slide>

        {/* Enhanced Main Product Card */}
        <Grow in timeout={1000}>
          <Card
            elevation={32}
            sx={{
              borderRadius: 8,
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              boxShadow:
                "0 32px 80px rgba(0, 0, 0, 0.15), 0 16px 40px rgba(0, 0, 0, 0.1)",
              transform: "perspective(1000px) rotateX(2deg)",
              transformOrigin: "center top",
              "&:hover": {
                transform: "perspective(1000px) rotateX(0deg) translateY(-8px)",
                boxShadow:
                  "0 40px 100px rgba(0, 0, 0, 0.2), 0 20px 50px rgba(0, 0, 0, 0.15)",
              },
              transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "8px",
                background:
                  "linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
                backgroundSize: "200% 100%",
                animation: "gradientShift 3s ease-in-out infinite",
              },
              "@keyframes gradientShift": {
                "0%, 100%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
              },
            }}
          >
            <Grid 
              container 
              sx={{ 
                minHeight: 700, 
                width: '100%',
                maxWidth: '100%', // Prevent container overflow
                margin: 0, // Remove any default margins
                '& > .MuiGrid-item': {
                  paddingLeft: 0, // Remove default Grid spacing
                  paddingTop: 0,
                }
              }} 
              spacing={0}
            >
              {/* Enhanced Product Image Section */}
              <Grid 
                item 
                xs={12} 
                md={4} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  minWidth: 0, // Prevent content overflow
                  maxWidth: { xs: '100%', md: '33.333333%' }, // Fixed width percentages
                  flexBasis: { xs: '100%', md: '33.333333%' },
                  flexShrink: 0, // Prevent shrinking
                  flexGrow: 0, // Prevent growing
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    minHeight: { xs: 300, md: 700 }, // Match container height
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 2, md: 3 }, // Reduced padding to prevent overflow
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Fade in timeout={1200}>
                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      <ProductImage
                        src={getProductImageUrl(product.image)}
                        alt={productName}
                        onImageLoad={() => setImageLoaded(true)}
                        t={t}
                      />
                    </Box>
                  </Fade>

                  {/* Floating Action Buttons */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 24,
                      right: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      zIndex: 2,
                    }}
                  >
                    <Slide direction="left" in timeout={1400}>
                      <Tooltip
                      title={
                      isFavorite
                      ? t('actions.removeFromFavorites')
                      : t('actions.addToFavorites')
                      }
                      placement="left"
                      arrow
                      >
                        <IconButton
                          onClick={() => setIsFavorite(!isFavorite)}
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(12px)",
                            width: 56,
                            height: 56,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            "&:hover": {
                              bgcolor: "white",
                              transform: "scale(1.15) rotate(5deg)",
                              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                            },
                            transition:
                              "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          }}
                        >
                          {isFavorite ? (
                            <FavoriteIcon color="error" sx={{ fontSize: 28 }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 28 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Slide>

                    <Slide direction="left" in timeout={1600}>
                      <Tooltip title={t('actions.shareProduct')} placement="left" arrow>
                        <IconButton
                          onClick={handleShare}
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(12px)",
                            width: 56,
                            height: 56,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            "&:hover": {
                              bgcolor: "white",
                              transform: "scale(1.15) rotate(-5deg)",
                              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                            },
                            transition:
                              "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          }}
                        >
                          <ShareIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                      </Tooltip>
                    </Slide>
                  </Box>

                  {/* Enhanced In Cart Indicator */}
                  {inCart && (
                    <Slide direction="up" in timeout={1800}>
                      <Card
                        elevation={12}
                        sx={{
                          position: "absolute",
                          bottom: 24,
                          left: 24,
                          right: 24,
                          background:
                            "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
                          color: "white",
                          borderRadius: 4,
                          p: 2,
                          boxShadow: "0 8px 32px rgba(76, 175, 80, 0.4)",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="h6" fontWeight={700}>
                              ✅ {t('status.inCart')}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {t('labels.quantity')}: {cartQty} {t('labels.items')}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Slide>
                  )}
                </Box>
              </Grid>

              {/* Product Details Section */}
              <Grid 
                item 
                xs={12} 
                md={5} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  minWidth: 0, // Prevent content overflow
                  maxWidth: { xs: '100%', md: '41.666667%' }, // Fixed width percentages (5/12)
                  flexBasis: { xs: '100%', md: '41.666667%' },
                  flexShrink: 0, // Prevent shrinking
                  flexGrow: 0, // Prevent growing
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, md: 3 }, // Reduced padding to prevent overflow
                    height: "100%",
                    minHeight: { xs: 300, md: 700 }, // Match container height
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(255, 255, 255, 0.95)",
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Box sx={{ 
                    position: "relative", 
                    zIndex: 1, 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    {/* Enhanced Product Information Section */}
                    <Box sx={{ flex: "0 0 auto" }}>
                      {/* Enhanced Product Title */}
                      <Card
                        elevation={3}
                        sx={{
                          p: 3,
                          mb: 3,
                          borderRadius: 4,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "100px",
                            height: "100px",
                            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                            borderRadius: "50%",
                            transform: "translate(30px, -30px)",
                          },
                        }}
                      >
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          sx={{ 
                            mb: 1,
                            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            lineHeight: 1.2
                          }}
                        >
                          {productName}
                        </Typography>
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CategoryIcon sx={{ fontSize: 20 }} />
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ opacity: 0.9 }}
                          >
                            {product.categoryName || t('product.uncategorized')}
                          </Typography>
                        </Box>
                      </Card>

                      {/* Enhanced Product Details Cards */}
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        {/* Product Code Card */}
                        {productCode && (
                          <Card
                            elevation={2}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: "2px solid",
                              borderColor: "primary.main",
                              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                }}
                              >
                                #
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                  {t('product.code')}
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="primary.main">
                                  {productCode}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        )}

                        {/* Unit Card */}
                        {unitLabel && (
                          <Card
                            elevation={2}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: "2px solid",
                              borderColor: "secondary.main",
                              background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                }}
                              >
                                U
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                  {t('product.unit')}
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="secondary.main">
                                  {unitLabel}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        )}
                      </Stack>

                      {/* Simplified Availability Status */}
                      <Alert
                        severity={product.available !== false ? "success" : "warning"}
                        variant="filled"
                        icon={
                          product.available !== false ? (
                            <CheckCircleIcon />
                          ) : (
                            <WarningIcon />
                          )
                        }
                        sx={{
                          borderRadius: 3,
                          fontWeight: 600,
                          mb: 3,
                          fontSize: "1rem",
                        }}
                      >
                        {product.available !== false
                          ? `✅ ${t('status.available')}`
                          : `⚠️ ${t('status.unavailable')}`}
                      </Alert>
                    </Box>

                    {/* Spacer to push cart section to bottom */}
                    <Box sx={{ flex: "1 1 auto" }} />

                  {/* Enhanced Add to Cart Section - Fixed at bottom */}
                    <Box sx={{ flex: "0 0 auto" }}>
                      <Card
                        elevation={6}
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          border: "3px solid",
                          borderColor: inCart ? "success.main" : "primary.main",
                          background: inCart
                            ? "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)"
                            : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: inCart
                              ? "linear-gradient(90deg, #4caf50, #81c784)"
                              : "linear-gradient(90deg, #2196f3, #64b5f6)",
                          },
                        }}
                      >
        <Typography
          variant="h6" // Reduced from h5
          fontWeight={700}
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: inCart ? "success.dark" : "primary.dark",
            mb: 1,
          }}
        >
          {inCart ? (
            <>
              <CheckCircleIcon fontSize="small" /> Already in Cart
            </>
          ) : (
            <>
              <ShoppingCartIcon fontSize="small" /> Add to Cart
            </>
          )}
        </Typography>

        {!inCart ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" mb={1}>
                {t('cart.selectQuantity')}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <QuantitySelector value={qty} setValue={setQty} min={1} max={99} size="medium" />
                <Typography variant="body2" color="text.secondary">
                  {qty > 1 ? t('cart.quantityItems', { count: qty }) : t('cart.oneItem')}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="medium"
              fullWidth
              startIcon={
                addingToCart ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <ShoppingCartIcon />
                )
              }
              onClick={handleAddToCart}
              disabled={product.available === false || addingToCart}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: 2,
                color: "white",
                background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #03DAC6 100%)",
                boxShadow: "0 4px 16px rgba(33, 150, 243, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1976D2 0%, #1BA3D3 50%, #00BFA5 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(33, 150, 243, 0.4)",
                  color: "white",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)",
                  color: "rgba(255, 255, 255, 0.7)",
                  transform: "none",
                  boxShadow: "none",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {addingToCart ? t('cart.adding') : t('cart.addToCart', { count: qty })}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "success.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "success.200",
              }}
            >
              <Typography variant="subtitle1" color="success.dark" fontWeight={600}>
                ✅ {t('status.itemInCart')}
              </Typography>
              <Typography variant="body2" color="success.dark">
                {t('labels.currentQuantity')}: <strong>{cartQty}</strong>
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate("/order-form")}
                sx={{
                  flex: 1,
                  py: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": {
                    transform: "translateY(-1px)",
                    color: "white",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                🛒 {t('actions.viewCartWithCount', { count: cartQty })}
              </Button>

              <Button
                variant="outlined"
                color="success"
                onClick={handleAddToCart}
                disabled={addingToCart}
                startIcon={
                  addingToCart ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ShoppingCartIcon fontSize="small" />
                  )
                }
                sx={{
                  flex: 1,
                  py: 1,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {addingToCart ? t('cart.adding') : t('cart.addMore')}
              </Button>
            </Stack>
          </Stack>
        )}
                      </Card>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Related Products Section */}
              <Grid 
                item 
                xs={12} 
                md={3} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  minWidth: 0, // Prevent content overflow
                  maxWidth: { xs: '100%', md: '25%' }, // Fixed width percentages (3/12)
                  flexBasis: { xs: '100%', md: '25%' },
                  flexShrink: 0, // Prevent shrinking
                  flexGrow: 0, // Prevent growing
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, md: 3 }, // Reduced padding to prevent overflow
                    height: { xs: 300, md: 700 }, // FIXED height - same as other sections
                    maxHeight: { xs: 300, md: 700 }, // Prevent expansion
                    minHeight: { xs: 300, md: 700 }, // Ensure minimum height
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    position: "relative",
                    display: "flex", // Enable flex layout
                    flexDirection: "column", // Stack content vertically
                    overflow: "hidden", // Prevent container overflow
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(255, 255, 255, 0.95)",
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Box sx={{ 
                    position: "relative", 
                    zIndex: 1, 
                    height: "100%", // Take full height
                    display: "flex", // Enable flex for child
                    flexDirection: "column", // Stack vertically
                    overflow: "hidden", // Prevent overflow
                  }}>
                    <RelatedProducts currentProduct={product} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grow>
      </Container>
    </Box>
  );
}
