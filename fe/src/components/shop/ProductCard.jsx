import { memo, useState, useCallback, useMemo } from "react";
import { 
  CardContent, 
  CardMedia, 
  CardActions, 
  Typography, 
  Stack, 
  Button, 
  Chip, 
  Box,
  Fade,
  IconButton,
  Tooltip,
  Skeleton,
  Badge,
  Zoom,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  LocalOffer as OfferIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CardBase from "../common/CardBase";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "context/CartContext/useCart";
import { useTranslation } from "react-i18next";

/** Enhanced Single product tile with improved UI/UX and advanced features */
function ProductCard({ 
  data, 
  onAdd, 
  showActions = true, 
  showFavorite = true,
  showShare = true,
  compact = false,
  loading = false,
  onFavoriteToggle,
  onShare,
  className,
  ...props 
}) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isInCart, getCartItemQty } = useCart();
  const { t } = useTranslation();

  // Memoized values for better performance
  const productData = useMemo(() => {
    if (!data) return null;
    
    const { id, name, image, unit, description, price, discount, stock, isNew, isFeatured } = data;
    
    return {
      id,
      name: name || 'Unnamed Product',
      image,
      unit,
      description: description || '',
      price: price || 0,
      discount: discount || 0,
      stock: stock || 0,
      isNew: isNew || false,
      isFeatured: isFeatured || false,
    };
  }, [data]);

  const inCart = useMemo(() => productData ? isInCart(productData.id) : false, [productData, isInCart]);
  const cartQty = useMemo(() => productData ? getCartItemQty(productData.id) : 0, [productData, getCartItemQty]);

  /* Always coerce unit to a string in case backend changes */
  const unitLabel = useMemo(() => {
    if (!productData?.unit) return "";
    if (typeof productData.unit === "string") return productData.unit;
    if (typeof productData.unit === "object") return productData.unit.name ?? "";
    return String(productData.unit);
  }, [productData?.unit]);

  const imageSrc = useMemo(() => {
    if (!productData?.image) return "/placeholder-prod.png";
    return productData.image.startsWith('http') 
      ? productData.image 
      : `/uploads/product-img/${productData.image}`;
  }, [productData?.image]);

  // Callbacks for better performance
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleViewProduct = useCallback(() => {
    if (productData?.id) {
      navigate(`/products/${productData.id}`);
    }
  }, [navigate, productData?.id]);

  const handleAddToCart = useCallback(() => {
    if (productData && onAdd) {
      onAdd(productData, qty);
      toast.success(t('product.addedToCart', 'Added to cart successfully!'));
    }
  }, [productData, onAdd, qty, t]);

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(prev => !prev);
    if (onFavoriteToggle && productData) {
      onFavoriteToggle(productData.id, !isFavorite);
    }
    toast.success(
      isFavorite 
        ? t('product.removedFromFavorites', 'Removed from favorites')
        : t('product.addedToFavorites', 'Added to favorites')
    );
  }, [isFavorite, onFavoriteToggle, productData, t]);

  const handleShare = useCallback(async () => {
    if (!productData) return;
    
    const shareData = {
      title: productData.name,
      text: productData.description,
      url: `${window.location.origin}/products/${productData.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success(t('product.linkCopied', 'Product link copied to clipboard!'));
      }
      
      if (onShare) {
        onShare(productData.id);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(t('product.shareError', 'Failed to share product'));
    }
  }, [productData, onShare, t]);

  const handleQuantityChange = useCallback((newQty) => {
    setQty(Math.max(1, newQty));
  }, []);

  // Loading state
  if (loading || !productData) {
    return <ProductCardSkeleton compact={compact} />;
  }

  return (
    <Fade in timeout={300}>
      <div>
        <CardBase 
          className={className}
          sx={{ 
            height: compact ? 280 : 360, 
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: inCart ? "2px solid #4caf50" : "1px solid #e0e0e0",
            boxShadow: inCart 
              ? "0 8px 32px rgba(76, 175, 80, 0.2)" 
              : "0 4px 16px rgba(0,0,0,0.08)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: inCart 
                ? "0 16px 48px rgba(76, 175, 80, 0.3)" 
                : "0 12px 32px rgba(0,0,0,0.15)",
            },
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          <Box sx={{ position: "relative", overflow: 'hidden' }}>
            {/* Product Badges */}
            <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
              <Stack direction="row" spacing={1}>
                {productData.isNew && (
                  <Zoom in timeout={500}>
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Zoom>
                )}
                {productData.isFeatured && (
                  <Zoom in timeout={700}>
                    <Chip
                      icon={<OfferIcon sx={{ fontSize: '0.8rem' }} />}
                      label="Featured"
                      size="small"
                      sx={{
                        bgcolor: 'warning.main',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Zoom>
                )}
                {productData.discount > 0 && (
                  <Zoom in timeout={900}>
                    <Chip
                      label={`-${productData.discount}%`}
                      size="small"
                      sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Zoom>
                )}
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
              <Stack spacing={1}>
                {showFavorite && (
                  <Fade in={isHovered || isFavorite} timeout={300}>
                    <IconButton
                      size="small"
                      onClick={handleFavoriteToggle}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: isFavorite ? 'error.main' : 'text.secondary',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Fade>
                )}
                
                {showShare && (
                  <Fade in={isHovered} timeout={400}>
                    <IconButton
                      size="small"
                      onClick={handleShare}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Fade>
                )}
              </Stack>
            </Box>

            {/* Product Image */}
            <Box sx={{ position: 'relative' }}>
              {!imageLoaded && !imageError && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={compact ? 120 : 160}
                  animation="wave"
                />
              )}
              
              <CardMedia
                component="img"
                height={compact ? 120 : 160}
                image={imageError ? "/placeholder-prod.png" : imageSrc}
                alt={productData.name}
                sx={{
                  objectFit: "cover",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  filter: inCart ? "brightness(0.95)" : "brightness(1)",
                  display: imageLoaded ? 'block' : 'none',
                }}
                onClick={handleViewProduct}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            </Box>
            
            {/* Overlay on hover */}
            <Fade in={isHovered && !inCart}>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(33, 150, 243, 0.8) 0%, rgba(33, 203, 243, 0.8) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 0.3s ease-in-out",
                }}
              >
                <Tooltip title={t('product.viewDetails', 'View Details')}>
                  <IconButton
                    onClick={handleViewProduct}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: "white",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Fade>

            {/* Status Chip */}
            {inCart && (
              <Zoom in timeout={300}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${t('product.inCart')} (${cartQty})`}
                  color="success"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    fontWeight: 600,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                />
              </Zoom>
            )}
          </Box>

          <CardContent sx={{ flexGrow: 1, p: compact ? 1.5 : 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant={compact ? "subtitle1" : "h6"}
                fontWeight={600}
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  color: inCart ? "success.main" : "text.primary",
                  mb: 1,
                  minHeight: compact ? 40 : 48,
                  fontSize: compact ? '0.9rem' : '1rem',
                  lineHeight: 1.2,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
                onClick={handleViewProduct}
              >
                {productData.name}
              </Typography>

              {!compact && productData.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                    mb: 1,
                    minHeight: 32,
                    fontSize: '0.85rem',
                    lineHeight: 1.2,
                  }}
                >
                  {productData.description}
                </Typography>
              )}

              {/* Price Display */}
              {productData.price > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                      sx={{ fontSize: compact ? '1rem' : '1.1rem' }}
                    >
                      ${productData.price.toFixed(2)}
                    </Typography>
                    {productData.discount > 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textDecoration: 'line-through',
                          fontSize: '0.8rem',
                        }}
                      >
                        ${(productData.price / (1 - productData.discount / 100)).toFixed(2)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
            </Box>

            {unitLabel && (
              <Box sx={{ mt: 'auto' }}>
                <Chip
                  label={`${t('product.unit')}: ${unitLabel}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    height: 22,
                    borderRadius: 1,
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>

          {showActions && (
            <CardActions sx={{ p: compact ? 1.5 : 2, pt: 0 }}>
              {!inCart ? (
                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                  {!compact && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.paper",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(qty - 1)}
                        disabled={qty <= 1}
                        sx={{ borderRadius: 1 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ minWidth: 32, textAlign: "center" }}
                      >
                        {qty}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(qty + 1)}
                        sx={{ borderRadius: 1 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    disabled={productData.stock === 0}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)",
                        boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        background: "grey.300",
                        color: "grey.500",
                      },
                    }}
                  >
                    {productData.stock === 0 
                      ? t('product.outOfStock', 'Out of Stock')
                      : t('product.addToCart', 'Add to Cart')
                    }
                  </Button>
                </Stack>
              ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => navigate("/order-form")}
                  sx={{
                    borderWidth: 2,
                    borderRadius: 2,
                    py: 1,
                    fontWeight: 600,
                    "&:hover": {
                      borderWidth: 2,
                      background: "rgba(76, 175, 80, 0.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {t('cart.viewCart', 'View Cart')} ({cartQty})
                </Button>
              )}
            </CardActions>
          )}
        </CardBase>
      </div>
    </Fade>
  );
}

/**
 * Skeleton component for loading state
 */
const ProductCardSkeleton = ({ compact = false }) => (
  <CardBase
    sx={{
      height: compact ? 280 : 360,
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Skeleton
      variant="rectangular"
      width="100%"
      height={compact ? 120 : 160}
      animation="wave"
    />
    
    <CardContent sx={{ flexGrow: 1, p: compact ? 1.5 : 2 }}>
      <Skeleton
        variant="text"
        width="80%"
        height={compact ? 24 : 28}
        animation="wave"
        sx={{ mb: 1 }}
      />
      
      {!compact && (
        <>
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            animation="wave"
            sx={{ mb: 0.5 }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={20}
            animation="wave"
            sx={{ mb: 1 }}
          />
        </>
      )}
      
      <Skeleton
        variant="text"
        width="40%"
        height={24}
        animation="wave"
        sx={{ mb: 1 }}
      />
      
      <Skeleton
        variant="rounded"
        width={80}
        height={22}
        animation="wave"
      />
    </CardContent>
    
    <CardActions sx={{ p: compact ? 1.5 : 2, pt: 0 }}>
      <Skeleton
        variant="rounded"
        width="100%"
        height={36}
        animation="wave"
      />
    </CardActions>
  </CardBase>
);

export default memo(ProductCard);
export { ProductCardSkeleton };