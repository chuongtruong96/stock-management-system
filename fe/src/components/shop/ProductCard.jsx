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
  Grow,
  Slide,
  Collapse,
  CircularProgress,
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
  DoNotDisturb as DoNotDisturbIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CardBase from "../common/CardBase";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "context/CartContext/useCart";
import { useTranslation } from "react-i18next";
import { useOrderWindow } from "../../context/OrderWindowContext";
import { getProductImageUrl } from "utils/apiUtils";
import { getProductName } from "utils/productNameUtils";

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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { isInCart, getCartItemQty } = useCart();
  const { t } = useTranslation('products');
  const { t: tCart } = useTranslation('cart');
  const { i18n } = useTranslation();
  const { canOrder, reason, isAdminOverride } = useOrderWindow();

  // Memoized values for better performance
  const productData = useMemo(() => {
    if (!data) return null;
    
    const { id, image, unit, description, price, discount, stock, isNew, isFeatured } = data;
    
    // Use the enhanced utility function to get the correct name and translation status
    const nameResult = getProductName(data, i18n.language);
    
    return {
      id,
      name: nameResult.name,
      hasTranslation: nameResult.hasTranslation,
      image,
      unit,
      description: description || '',
      price: price || 0,
      discount: discount || 0,
      stock: stock || 0,
      isNew: isNew || false,
      isFeatured: isFeatured || false,
    };
  }, [data, i18n.language]);

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
      : getProductImageUrl(productData.image);
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

  const handleAddToCart = useCallback(async () => {
    if (productData && onAdd && !isAddingToCart) {
      setIsAddingToCart(true);
      
      try {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onAdd(productData, qty);
        
        // Show success animation
        setShowSuccess(true);
        toast.success(t('product.addedToCart'), {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reset success state after animation
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
        
      } catch (error) {
        toast.error(t('product.addToCartError'));
      } finally {
        setIsAddingToCart(false);
      }
    }
  }, [productData, onAdd, qty, t, isAddingToCart]);

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(prev => !prev);
    if (onFavoriteToggle && productData) {
      onFavoriteToggle(productData.id, !isFavorite);
    }
    toast.success(
      isFavorite 
        ? t('product.removedFromFavorites')
        : t('product.addedToFavorites')
    );
  }, [isFavorite, onFavoriteToggle, productData, t]);

  const handleShare = useCallback(async () => {
    if (!productData || isSharing) return;
    
    setIsSharing(true);
    
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
        toast.success(t('product.linkCopied'), {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
      
      if (onShare) {
        onShare(productData.id);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(t('product.shareError'));
    } finally {
      setTimeout(() => setIsSharing(false), 500);
    }
  }, [productData, onShare, t, isSharing]);

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
            height: compact ? 280 : 350, 
            borderRadius: 2.5,
            position: 'relative',
            overflow: 'hidden',
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: inCart ? "2px solid #4caf50" : "1px solid #e0e0e0",
            boxShadow: inCart 
              ? "0 8px 32px rgba(76, 175, 80, 0.2)" 
              : "0 2px 8px rgba(0,0,0,0.06)",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: inCart 
                ? "0 16px 48px rgba(76, 175, 80, 0.3)" 
                : "0 8px 24px rgba(0,0,0,0.12)",
            },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
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
                      disabled={isSharing}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'scale(1.1)',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(255, 255, 255, 0.7)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {isSharing ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <ShareIcon />
                      )}
                    </IconButton>
                  </Fade>
                )}
              </Stack>
            </Box>

            {/* Product Image */}
            <Box 
              sx={{ 
                position: 'relative',
                height: compact ? 110 : 140,
                overflow: 'hidden',
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!imageLoaded && !imageError && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{ position: 'absolute', top: 0, left: 0 }}
                />
              )}
              
              <CardMedia
                component="img"
                image={imageError ? "/placeholder-prod.png" : imageSrc}
                alt={productData.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: "contain",
                  objectPosition: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  filter: inCart ? "brightness(0.95)" : "brightness(1)",
                  display: imageLoaded ? 'block' : 'none',
                  padding: '8px',
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
                <Tooltip title={t('product.viewDetails')}>
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
                  label={`${t('status.inCart')} (${cartQty})`}
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

          <CardContent sx={{ flexGrow: 1, p: compact ? 2 : 2.5, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant={compact ? "subtitle1" : "h6"}
                  fontWeight={600}
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                    color: inCart ? "success.main" : "text.primary",
                    minHeight: compact ? 44 : 52,
                    fontSize: compact ? '0.95rem' : '1.05rem',
                    lineHeight: 1.3,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                  onClick={handleViewProduct}
                >
                  {productData.name}
                </Typography>
                
                {/* Translation Status Indicator */}
                {!productData.hasTranslation && (
                  <Tooltip title={i18n.language === 'en' ? 'English translation not available' : 'Bản dịch tiếng Việt chưa có'}>
                    <Chip
                      label={i18n.language === 'en' ? 'VN' : 'EN'}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.6rem',
                        height: 16,
                        mt: 0.5,
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        '& .MuiChip-label': {
                          px: 0.5,
                        },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>

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
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                      sx={{ fontSize: compact ? '1.1rem' : '1.25rem' }}
                    >
                      ${productData.price.toFixed(2)}
                    </Typography>
                    {productData.discount > 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textDecoration: 'line-through',
                          fontSize: '0.85rem',
                          opacity: 0.7,
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
            <CardActions sx={{ p: compact ? 2 : 2.5, pt: 0 }}>
              {!inCart ? (
                <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                  {!compact && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2.5,
                        bgcolor: "background.paper",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(qty - 1)}
                        disabled={qty <= 1}
                        sx={{ 
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ minWidth: 36, textAlign: "center", px: 0.5 }}
                      >
                        {qty}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(qty + 1)}
                        sx={{ 
                          borderRadius: 1.5,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      isAddingToCart ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : showSuccess ? (
                        <Zoom in={showSuccess} timeout={300}>
                          <CheckCircleIcon />
                        </Zoom>
                      ) : canOrder ? (
                        <ShoppingCartIcon />
                      ) : (
                        <DoNotDisturbIcon />
                      )
                    }
                    onClick={handleAddToCart}
                    disabled={!canOrder || isAddingToCart}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: compact ? '0.85rem' : '0.9rem',
                      background: showSuccess
                        ? "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)"
                        : canOrder 
                        ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                        : "linear-gradient(45deg, #f44336 30%, #ff5722 90%)",
                      boxShadow: showSuccess
                        ? "0 3px 10px rgba(76, 175, 80, 0.25)"
                        : canOrder 
                        ? "0 3px 10px rgba(33, 150, 243, 0.25)"
                        : "0 3px 10px rgba(244, 67, 54, 0.25)",
                      "&:hover": {
                        background: showSuccess
                          ? "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)"
                          : canOrder 
                          ? "linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)"
                          : "linear-gradient(45deg, #d32f2f 30%, #f57c00 90%)",
                        boxShadow: showSuccess
                          ? "0 5px 15px rgba(76, 175, 80, 0.35)"
                          : canOrder 
                          ? "0 5px 15px rgba(33, 150, 243, 0.35)"
                          : "0 5px 15px rgba(244, 67, 54, 0.35)",
                        transform: isAddingToCart ? "none" : "translateY(-1px)",
                      },
                      "&:disabled": {
                        background: !canOrder 
                          ? "linear-gradient(45deg, #f44336 30%, #ff5722 90%)"
                          : isAddingToCart
                          ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                          : "grey.300",
                        color: (!canOrder || isAddingToCart) ? "white" : "grey.500",
                        boxShadow: !canOrder 
                          ? "0 3px 10px rgba(244, 67, 54, 0.25)"
                          : isAddingToCart
                          ? "0 3px 10px rgba(33, 150, 243, 0.25)"
                          : "none",
                        opacity: isAddingToCart ? 0.8 : 1,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {isAddingToCart 
                      ? t('product.adding')
                      : showSuccess
                      ? t('product.added')
                      : !canOrder 
                      ? t('product.orderWindowClosed')
                      : t('product.addToCart')
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
                    borderRadius: 2.5,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: compact ? '0.85rem' : '0.9rem',
                    "&:hover": {
                      borderWidth: 2,
                      background: "rgba(76, 175, 80, 0.08)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {tCart('actions.viewCart')} ({cartQty})
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
      height: compact ? 280 : 350,
      borderRadius: 2.5,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
    }}
  >
    <Skeleton
      variant="rectangular"
      width="100%"
      height={compact ? 110 : 140}
      animation="wave"
      sx={{ bgcolor: 'grey.100' }}
    />
    
    <CardContent sx={{ flexGrow: 1, p: compact ? 2 : 2.5 }}>
      <Skeleton
        variant="text"
        width="85%"
        height={compact ? 26 : 30}
        animation="wave"
        sx={{ mb: 1.5, bgcolor: 'grey.200' }}
      />
      
      {!compact && (
        <>
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            animation="wave"
            sx={{ mb: 0.5, bgcolor: 'grey.100' }}
          />
          <Skeleton
            variant="text"
            width="65%"
            height={20}
            animation="wave"
            sx={{ mb: 1.5, bgcolor: 'grey.100' }}
          />
        </>
      )}
      
      <Skeleton
        variant="text"
        width="45%"
        height={28}
        animation="wave"
        sx={{ mb: 1.5, bgcolor: 'grey.200' }}
      />
      
      <Skeleton
        variant="rounded"
        width={90}
        height={24}
        animation="wave"
        sx={{ bgcolor: 'grey.100' }}
      />
    </CardContent>
    
    <CardActions sx={{ p: compact ? 2 : 2.5, pt: 0 }}>
      <Skeleton
        variant="rounded"
        width="100%"
        height={40}
        animation="wave"
        sx={{ borderRadius: 2.5, bgcolor: 'grey.200' }}
      />
    </CardActions>
  </CardBase>
);

export default memo(ProductCard);
export { ProductCardSkeleton };