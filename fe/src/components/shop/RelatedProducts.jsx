import React from 'react';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Alert,
  Stack,
} from '@mui/material';
import {
  Category as CategoryIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from 'services/api';
import RelatedProductCard from './RelatedProductCard';

const RelatedProducts = ({ currentProduct }) => {
  const navigate = useNavigate();
  
  const { data: relatedProducts, isLoading, error } = useQuery({
    queryKey: ["relatedProducts", currentProduct?.categoryId],
    queryFn: async () => {
      if (!currentProduct?.categoryId) return [];
      
      const products = await productApi.byCategory(currentProduct.categoryId);
      // Filter out current product - NO LIMIT for better scrolling demonstration
      return products
        .filter(p => (p.productId || p.id) !== (currentProduct.productId || currentProduct.id));
    },
    enabled: !!currentProduct?.categoryId,
  });

  const handleViewAllCategory = () => {
    navigate(`/products?categoryId=${currentProduct.categoryId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header Skeleton */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            borderRadius: 3,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CategoryIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Related Products
            </Typography>
          </Box>
          <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        </Box>
        
        {/* Content Skeleton */}
        <Stack spacing={2} sx={{ flex: 1 }}>
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} sx={{ display: 'flex', gap: 1.5, p: 2 }}>
              <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} />
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            borderRadius: 3,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CategoryIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Related Products
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Unable to load at the moment
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ borderRadius: 3, flex: 1, display: 'flex', alignItems: 'center' }}>
          Unable to load related products at the moment.
        </Alert>
      </Box>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            borderRadius: 3,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CategoryIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Related Products
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            From "{currentProduct.categoryName || 'Same Category'}"
          </Typography>
        </Box>
        
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            bgcolor: 'info.50',
            border: '1px solid',
            borderColor: 'info.200',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" sx={{ mb: 2 }}>
            No related products found in this category yet.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/products')}
            sx={{
              alignSelf: 'flex-start',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                color: 'white',
              },
            }}
          >
            Browse All Products
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Enhanced Header Area */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          borderRadius: 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CategoryIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Related Products
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            From "{currentProduct.categoryName || 'Same Category'}"
          </Typography>
        </Box>
      </Box>

      {/* 
        SCROLLABLE CONTAINER EXPLANATION:
        
        1. FLEX LAYOUT SETUP:
           - Parent: display: flex, flexDirection: column
           - This child: flex: 1 (takes remaining space after header/footer)
           
        2. SCROLLING PROPERTIES:
           - overflowY: 'auto' = Show scrollbar only when content overflows
           - minHeight: 0 = CRITICAL! Allows flex child to shrink below content size
           
        3. HEIGHT CALCULATION:
           - Container height = Parent height - Header height - Footer height
           - When content > calculated height → scrollbar appears
           
        4. CUSTOM SCROLLBAR STYLING:
           - ::-webkit-scrollbar = Overall scrollbar
           - ::-webkit-scrollbar-track = Background track
           - ::-webkit-scrollbar-thumb = Draggable handle
      */}
      <Box
        sx={{
          // FLEX PROPERTIES FOR SCROLLING
          flex: 1, // Takes all remaining space in parent
          minHeight: 0, // CRITICAL: Allows shrinking below content size
          
          // SCROLLING BEHAVIOR
          overflowY: 'auto', // Show scrollbar only when needed
          overflowX: 'hidden', // Prevent horizontal scroll
          
          // LAYOUT
          display: 'flex',
          flexDirection: 'column',
          
          // SPACING & PADDING
          pr: 1, // Right padding for scrollbar space
          pb: 1, // Bottom padding
          
          // CUSTOM SCROLLBAR STYLING (Webkit browsers)
          '&::-webkit-scrollbar': {
            width: 10, // Scrollbar width
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(0,0,0,0.05)', // Track background
            borderRadius: 5,
            margin: '4px', // Margin from container edges
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'primary.main', // Thumb color
            borderRadius: 5,
            border: '2px solid transparent', // Creates padding effect
            backgroundClip: 'content-box', // Makes border transparent
            '&:hover': {
              bgcolor: 'primary.dark', // Darker on hover
            },
            '&:active': {
              bgcolor: 'primary.light', // Lighter when dragging
            },
          },
          
          // SMOOTH SCROLLING
          scrollBehavior: 'smooth',
          
          // SCROLL SNAP (Optional - makes scrolling snap to items)
          // scrollSnapType: 'y mandatory',
        }}
      >
        {/* 
          CONTENT CONTAINER:
          - Stack provides consistent spacing between items
          - Each item can have scroll-snap-align for snap scrolling
        */}
        <Stack 
          spacing={2} 
          sx={{ 
            // Ensures content can grow beyond container
            minHeight: 'min-content',
            pb: 2, // Bottom padding for last item
          }}
        >
          {relatedProducts.map((product, index) => (
            <Box
              key={product.productId || product.id}
              sx={{
                // SCROLL SNAP ALIGNMENT (uncomment to enable)
                // scrollSnapAlign: 'start',
                
                // FADE IN ANIMATION (optional)
                opacity: 1,
                transform: 'translateY(0)',
                transition: 'all 0.3s ease-in-out',
                
                // HOVER EFFECTS
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              }}
            >
              <RelatedProductCard product={product} />
            </Box>
          ))}
          
          {/* SCROLL INDICATOR - Shows when there are many items */}
          {relatedProducts.length > 5 && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontStyle: 'italic',
              }}
            >
              <Typography variant="caption">
                📜 Scroll to see more products ({relatedProducts.length} total)
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* View All Button */}
      {relatedProducts.length >= 3 && (
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllCategory}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              color: 'white',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          View All in {currentProduct.categoryName}
        </Button>
      )}
    </Box>
  );
};

export default RelatedProducts;