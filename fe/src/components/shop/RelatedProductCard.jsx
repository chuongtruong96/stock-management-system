import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from 'context/CartContext/useCart';
import { getProductImageUrl } from 'utils/apiUtils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const RelatedProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const [adding, setAdding] = useState(false);
  const { t } = useTranslation('products');

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    if (adding) return;

    setAdding(true);
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
      
      addItem(normalizedProduct, 1);
      toast.success(t('product.addedToCart'), {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(t('errors.addToCartError'));
    } finally {
      setAdding(false);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/products/${product.productId || product.id}`);
  };

  const productName = product.productName || product.name || 'Unknown Product';
  const unitLabel = typeof product.unit === "object" && product.unit !== null
    ? product.unit.unitName || product.unit.name || product.unit.nameVn
    : product.unitName || product.unit || '';

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
      onClick={handleViewDetails}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {/* Product Image */}
          <Box
            component="img"
            src={getProductImageUrl(product.image) || "/placeholder-prod.png"}
            alt={productName}
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1,
              bgcolor: 'grey.100',
              flexShrink: 0,
            }}
          />

          {/* Product Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              {productName}
            </Typography>
            
            {unitLabel && (
              <Typography variant="caption" color="text.secondary">
                {t('product.unit')}: {unitLabel}
              </Typography>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <Tooltip title={t('actions.addToCart')}>
                <IconButton
                  size="small"
                  onClick={handleQuickAdd}
                  disabled={adding || product.available === false}
                  sx={{
                    bgcolor: isInCart(product.productId || product.id) ? 'success.main' : 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: isInCart(product.productId || product.id) ? 'success.dark' : 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'grey.300',
                    },
                  }}
                >
                  {adding ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AddIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={t('actions.viewDetails')}>
                <IconButton
                  size="small"
                  onClick={handleViewDetails}
                  sx={{
                    bgcolor: 'grey.200',
                    '&:hover': {
                      bgcolor: 'grey.300',
                    },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RelatedProductCard;