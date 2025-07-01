import { 
  Box, 
  Skeleton, 
  Alert, 
  Stack, 
  Typography,
  Paper,
  Container,
  Grid,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  SearchOff as NoResultsIcon,
  Inventory as ProductsIcon,
  Close as CloseIcon,
  Visibility as QuickViewIcon,
  ShoppingCart as CartIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import ProductRow  from "./ProductRow";
import LoadingSpinner from "../common/LoadingSpinner";
import { NoResultsFound } from "../common/EnhancedEmptyState";

export default function ProductGrid({
  products = [],
  loading  = false,
  view     = "grid",
  onAddToCart,
}) {
  const valid = useMemo(() => products.filter(Boolean), [products]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  };

  const QuickViewModal = () => {
    if (!quickViewProduct) return null;

    return (
      <Modal
        open={quickViewOpen}
        onClose={handleCloseQuickView}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backdropFilter: 'blur(8px)' }
        }}
      >
        <Fade in={quickViewOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
              maxWidth: 800,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 4,
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              p: 0,
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              pb: 2,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Quick View
              </Typography>
              <IconButton 
                onClick={handleCloseQuickView}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    bgcolor: 'error.light',
                    color: 'error.main',
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
              <Grid container spacing={3}>
                {/* Product Image */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                    }}
                  >
                    {quickViewProduct.imageUrl ? (
                      <img
                        src={quickViewProduct.imageUrl}
                        alt={quickViewProduct.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <ProductsIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                    )}
                  </Paper>
                </Grid>

                {/* Product Details */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                        {quickViewProduct.name}
                      </Typography>
                      {quickViewProduct.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {quickViewProduct.description}
                        </Typography>
                      )}
                    </Box>

                    <Divider />

                    {/* Price */}
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        ${quickViewProduct.price?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>

                    {/* Stock Status */}
                    <Box>
                      <Chip
                        label={quickViewProduct.stock > 0 ? `${quickViewProduct.stock} in stock` : 'Out of stock'}
                        color={quickViewProduct.stock > 0 ? 'success' : 'error'}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>

                    {/* Category */}
                    {quickViewProduct.category && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Category
                        </Typography>
                        <Chip
                          label={quickViewProduct.category}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      </Box>
                    )}

                    {/* Actions */}
                    <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                      <Button
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={() => {
                          onAddToCart?.(quickViewProduct, 1);
                          handleCloseQuickView();
                        }}
                        disabled={quickViewProduct.stock <= 0}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCloseQuickView}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Close
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  };

  /* ─── loading ─── */
  if (loading) {
    if (view === "list") {
      return (
        <Stack spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="rectangular" width={120} height={80} sx={{ borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
                </Box>
                <Box>
                  <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      );
    }

    return (
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid 
            item 
            xs={12}   // 1 product per row on mobile
            sm={6}    // 2 products per row on small screens
            md={4}    // 3 products per row on medium screens
            lg={3}    // 4 products per row on large screens
            xl={3}    // 4 products per row on extra large screens
            key={i}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Skeleton variant="rectangular" height={180} />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={32} sx={{ mt: 2, borderRadius: 1 }} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  /* ─── empty ─── */
  if (!valid.length) {
    return (
      <NoResultsFound
        size="large"
        animation="float"
        actions={[
          {
            label: 'Clear Filters',
            variant: 'contained',
            icon: FilterIcon,
            onClick: () => window.location.reload(),
          },
          {
            label: 'Browse All',
            variant: 'outlined',
            onClick: () => window.location.href = '/products',
          },
        ]}
        suggestions={[
          'Try different keywords',
          'Remove some filters',
          'Check spelling',
          'Browse categories',
        ]}
      />
    );
  }

  /* ─── list view ─── */
  if (view === "list") {
    return (
      <>
        <Fade in={true} timeout={300}>
          <Stack spacing={2}>
            {valid.map((p, index) => (
              <Fade key={p.id || p.productId || index} in={true} timeout={400 + (index * 50)} style={{ transitionDelay: `${index * 50}ms` }}>
                <Box
                  sx={{
                    '&:hover': {
                      transform: 'translateX(8px)',
                      transition: 'transform 0.3s ease-out',
                    },
                    transition: 'transform 0.3s ease-out',
                  }}
                >
                  <ProductRow
                    data={p}
                    onAdd={(prod, q) => onAddToCart?.(prod, q)}
                    onQuickView={() => handleQuickView(p)}
                  />
                </Box>
              </Fade>
            ))}
          </Stack>
        </Fade>
        
        {/* Quick View Modal */}
        <QuickViewModal />
      </>
    );
  }

  /* ─── grid view ─── */
  return (
    <>
      <Fade in={true} timeout={300}>
        <Grid container spacing={2}>
          {valid.map((p, index) => (
            <Grid 
              item 
              xs={12}   // 1 product per row on mobile
              sm={6}    // 2 products per row on small screens
              md={4}    // 3 products per row on medium screens
              lg={3}    // 4 products per row on large screens
              xl={3}    // 4 products per row on extra large screens
              key={p.id || p.productId || index}
            >
              <Fade in={true} timeout={400 + (index * 50)} style={{ transitionDelay: `${index * 50}ms` }}>
                <Box
                  sx={{
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease-out',
                    },
                    transition: 'transform 0.3s ease-out',
                  }}
                >
                  <ProductCard
                    data={p}
                    onAdd={(prod, q) => onAddToCart?.(prod, q)}
                    onQuickView={() => handleQuickView(p)}
                  />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Fade>
      
      {/* Quick View Modal */}
      <QuickViewModal />
    </>
  );
}