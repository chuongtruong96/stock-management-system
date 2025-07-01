// Phase 4: Product Comparison Modal Component
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardMedia,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Tabs,
  Tab,
  Divider,
  Rating,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Compare as CompareIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

const ProductComparisonModal = ({
  open = false,
  onClose,
  comparisonData,
  onRemoveProduct,
  onAddToCart,
  onToggleFavorite,
  isFavorite
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  if (!comparisonData || comparisonData.items.length === 0) {
    return null;
  }

  const { items, matrix, priceAnalysis, features } = comparisonData;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getAttributeDisplayName = (attr) => {
    const displayNames = {
      name: 'Product Name',
      price: 'Price',
      inStock: 'Availability',
      rating: 'Rating',
      category: 'Category',
      description: 'Description',
      brand: 'Brand',
      model: 'Model',
      color: 'Color',
      size: 'Size',
      weight: 'Weight',
      dimensions: 'Dimensions',
      warranty: 'Warranty'
    };
    return displayNames[attr] || attr.charAt(0).toUpperCase() + attr.slice(1);
  };

  const getPriceIndicator = (price) => {
    if (!priceAnalysis || priceAnalysis.min === priceAnalysis.max) return null;
    
    if (price === priceAnalysis.min) {
      return <TrendingDownIcon sx={{ color: 'success.main', fontSize: 16 }} />;
    }
    if (price === priceAnalysis.max) {
      return <TrendingUpIcon sx={{ color: 'error.main', fontSize: 16 }} />;
    }
    return null;
  };

  const filteredMatrix = showOnlyDifferences 
    ? matrix.filter(row => row.hasVariation)
    : matrix;

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareIcon />
          <Typography variant="h6" fontWeight="600">
            Product Comparison
          </Typography>
          <Chip
            label={`${items.length} products`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white'
            }}
          />
        </Box>
        
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Detailed Comparison" />
            <Tab label="Price Analysis" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ height: 'calc(90vh - 200px)', overflow: 'auto', p: 3 }}>
          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 2 }}>
              {items.map((product) => (
                <Card
                  key={product.id}
                  elevation={3}
                  sx={{
                    position: 'relative',
                    transition: 'all 0.3s ease-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  {/* Remove Button */}
                  <IconButton
                    size="small"
                    onClick={() => onRemoveProduct?.(product.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        color: 'error.main'
                      }
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>

                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl || '/api/placeholder/300/200'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h5" color="primary" fontWeight="700">
                        ${product.price?.toFixed(2)}
                      </Typography>
                      {getPriceIndicator(product.price)}
                    </Box>

                    {product.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={product.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({product.rating})
                        </Typography>
                      </Box>
                    )}

                    <Chip
                      label={product.inStock ? 'In Stock' : 'Out of Stock'}
                      color={product.inStock ? 'success' : 'error'}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CartIcon />}
                        onClick={() => onAddToCart?.(product)}
                        disabled={!product.inStock}
                        fullWidth
                      >
                        Add to Cart
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => onToggleFavorite?.(product)}
                        color={isFavorite?.(product.id) ? 'error' : 'default'}
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>

          {/* Detailed Comparison Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyDifferences}
                    onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                  />
                }
                label="Show only differences"
              />
            </Box>

            <TableContainer component={Paper} elevation={2}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>
                      Attribute
                    </TableCell>
                    {items.map((product) => (
                      <TableCell key={product.id} align="center" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMatrix.map((row) => (
                    <TableRow
                      key={row.attribute}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'grey.25' },
                        ...(row.hasVariation && {
                          backgroundColor: 'primary.50',
                          '&:hover': { backgroundColor: 'primary.100' }
                        })
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {getAttributeDisplayName(row.attribute)}
                        {row.hasVariation && (
                          <Chip
                            label="Different"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      {row.values.map((value) => (
                        <TableCell key={value.productId} align="center">
                          {row.attribute === 'price' && value.value && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Typography>{value.displayValue}</Typography>
                              {getPriceIndicator(parseFloat(value.value))}
                            </Box>
                          )}
                          {row.attribute === 'rating' && value.value && (
                            <Rating value={parseFloat(value.value)} readOnly size="small" />
                          )}
                          {row.attribute === 'inStock' && (
                            <Chip
                              label={value.displayValue}
                              color={value.value ? 'success' : 'error'}
                              size="small"
                            />
                          )}
                          {!['price', 'rating', 'inStock'].includes(row.attribute) && (
                            <Typography>{value.displayValue}</Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Price Analysis Tab */}
          <TabPanel value={activeTab} index={2}>
            {priceAnalysis && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Price Analysis
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lowest Price
                    </Typography>
                    <Typography variant="h4" color="success.main" fontWeight="700">
                      ${priceAnalysis.min.toFixed(2)}
                    </Typography>
                  </Card>
                  
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Highest Price
                    </Typography>
                    <Typography variant="h4" color="error.main" fontWeight="700">
                      ${priceAnalysis.max.toFixed(2)}
                    </Typography>
                  </Card>
                  
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Average Price
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="700">
                      ${priceAnalysis.average.toFixed(2)}
                    </Typography>
                  </Card>
                  
                  <Card elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Price Range
                    </Typography>
                    <Typography variant="h4" color="text.primary" fontWeight="700">
                      ${priceAnalysis.range.toFixed(2)}
                    </Typography>
                  </Card>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  💡 The lowest priced item offers the best value, while the highest priced item might have premium features.
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<CartIcon />}
          onClick={() => {
            items.forEach(product => onAddToCart?.(product));
            onClose();
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          Add All to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductComparisonModal;