// Phase 4: Recently Viewed Products Component
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Button,
  Fade,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  AccessTime as TimeIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const RecentlyViewed = ({ 
  products = [], 
  onProductClick, 
  onRemoveProduct, 
  onClearAll,
  maxItems = 10 
}) => {
  if (products.length === 0) {
    return (
      <Card 
        elevation={0} 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(103, 126, 234, 0.02) 100%)',
          border: '1px dashed rgba(103, 126, 234, 0.2)'
        }}
      >
        <VisibilityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No recently viewed products
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Products you view will appear here for quick access
        </Typography>
      </Card>
    );
  }

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Recently Viewed
          </Typography>
          <Chip 
            label={products.length} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        {products.length > 0 && (
          <Tooltip title="Clear all recently viewed">
            <IconButton 
              onClick={onClearAll}
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'error.main' }
              }}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Products Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
          maxHeight: 400,
          overflowY: 'auto',
          pr: 1
        }}
      >
        {products.slice(0, maxItems).map((product, index) => (
          <Fade in={true} timeout={300 + index * 100} key={product.id}>
            <Card
              elevation={2}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                  '& .product-image': {
                    transform: 'scale(1.05)'
                  }
                }
              }}
              onClick={() => onProductClick?.(product)}
            >
              {/* Remove Button */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProduct?.(product.id);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    color: 'error.main'
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              {/* Product Image */}
              <CardMedia
                component="img"
                height="120"
                image={product.imageUrl || '/api/placeholder/200/120'}
                alt={product.name}
                className="product-image"
                sx={{
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease-out'
                }}
              />

              {/* Product Info */}
              <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {product.name}
                </Typography>

                <Typography
                  variant="body2"
                  color="primary"
                  fontWeight="700"
                  sx={{ mb: 1 }}
                >
                  ${product.price?.toFixed(2) || 'N/A'}
                </Typography>

                {/* Time Viewed */}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(product.viewedAt)}
                  </Typography>
                </Stack>

                {/* Stock Status */}
                <Chip
                  label={product.inStock ? 'In Stock' : 'Out of Stock'}
                  size="small"
                  color={product.inStock ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ 
                    mt: 1,
                    height: 20,
                    fontSize: '0.7rem'
                  }}
                />
              </CardContent>
            </Card>
          </Fade>
        ))}
      </Box>

      {/* Show More Button */}
      {products.length > maxItems && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {/* Handle show more */}}
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Show {products.length - maxItems} more
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RecentlyViewed;