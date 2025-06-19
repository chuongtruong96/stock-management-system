import { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { useCart } from "../../../context/CartContext/useCart";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "services/api";
import { useTranslation } from "react-i18next";
import QuantitySelector from "components/shop/QuantitySelector";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addItem, isInCart, getCartItemQty } = useCart();
  const [qty, setQty] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Use direct API call instead of useProducts hook
  const { data: product, isLoading: loading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        const response = await productApi.byId(id);
        console.log('Product detail response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
    enabled: !!id,
  });

  const productId = product?.productId || product?.id;
  const inCart = productId ? isInCart(productId) : false;
  const cartQty = productId ? getCartItemQty(productId) : 0;

  useEffect(() => {
    if (product) {
      const productName = product.productName || product.name;
      document.title = `${productName} - Stationery Management`;
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
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
      toast.success('Added to cart successfully!');
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
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'Product not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          variant="contained"
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  const productName = product.productName || product.name || 'Unknown Product';
  const productDesc = product.description || '';
  const productCode = product.code || product.productCode || '';
  const unitLabel = typeof product.unit === "object" && product.unit !== null
    ? product.unit.unitName || product.unit.name || product.unit.nameVn
    : product.unitName || product.unit || '';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Back Button */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back to Products
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Zoom in={imageLoaded} timeout={500}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'grey.50',
              }}
            >
              <Box
                component="img"
                src={product.image || "/placeholder-prod.png"}
                alt={productName}
                onLoad={() => setImageLoaded(true)}
                sx={{
                  width: '100%',
                  height: { xs: 300, md: 500 },
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
              
              {/* Action Buttons Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <IconButton
                  onClick={() => setIsFavorite(!isFavorite)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'white' },
                  }}
                >
                  {isFavorite ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                
                <IconButton
                  onClick={handleShare}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'white' },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Box>

              {/* In Cart Indicator */}
              {inCart && (
                <Chip
                  label={`In Cart (${cartQty})`}
                  color="success"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    fontWeight: 600,
                  }}
                />
              )}
            </Paper>
          </Zoom>
        </Grid>

        {/* Product Information */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={600}>
            <Stack spacing={3}>
              {/* Product Title */}
              <Box>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {productName}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={<CategoryIcon />}
                    label={product.categoryName || 'Uncategorized'}
                    variant="outlined"
                    size="small"
                  />
                  {productCode && (
                    <Chip
                      icon={<InventoryIcon />}
                      label={`Code: ${productCode}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {unitLabel && (
                    <Chip
                      icon={<LocalOfferIcon />}
                      label={`Unit: ${unitLabel}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Stack>
              </Box>

              {/* Product Description */}
              {productDesc && (
                <Card elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <InfoIcon color="primary" fontSize="small" />
                      <Typography variant="h6" fontWeight={600}>
                        Description
                      </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                      {productDesc}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Availability Status */}
              <Alert
                severity={product.available !== false ? "success" : "warning"}
                sx={{ borderRadius: 2 }}
              >
                {product.available !== false
                  ? "✅ Available for ordering"
                  : "⚠️ Currently unavailable"}
              </Alert>

              <Divider />

              {/* Add to Cart Section */}
              <Card
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: inCart ? 'success.main' : 'primary.main',
                  bgcolor: inCart ? 'success.50' : 'primary.50',
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {inCart ? '✅ Already in Cart' : '🛒 Add to Cart'}
                </Typography>

                {!inCart ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Quantity
                      </Typography>
                      <QuantitySelector
                        value={qty}
                        setValue={setQty}
                        min={1}
                        max={99}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={handleAddToCart}
                      disabled={product.available === false}
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      Add {qty} to Cart
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Typography variant="body1" color="success.dark">
                      This item is already in your cart with quantity: {cartQty}
                    </Typography>
                    
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => navigate('/order-form')}
                        sx={{ flex: 1 }}
                      >
                        View Cart
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleAddToCart}
                        sx={{ flex: 1 }}
                      >
                        Add More
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Card>

              {/* Quick Actions */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  sx={{ flex: 1 }}
                >
                  Continue Shopping
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/order-history')}
                  sx={{ flex: 1 }}
                >
                  Order History
                </Button>
              </Stack>
            </Stack>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}