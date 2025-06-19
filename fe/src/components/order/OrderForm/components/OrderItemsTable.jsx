// src/components/order/OrderForm/components/OrderItemsTable.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Enhanced order items table with proper alignment and responsive design
 */
const OrderItemsTable = ({ items = [], loading = false, emptyMessage = "No items in cart" }) => {
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          Loading items...
        </Typography>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h2" sx={{ opacity: 0.3, mb: 2 }}>
          🛒
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                bgcolor: '#f8f9fa',
                color: 'text.primary',
                width: '50%',
                textAlign: 'left',
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
                py: 2,
              }}
            >
              Product Name
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                bgcolor: '#f8f9fa',
                color: 'text.primary',
                width: '25%',
                textAlign: 'center',
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
                py: 2,
              }}
            >
              Quantity
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                bgcolor: '#f8f9fa',
                color: 'text.primary',
                width: '25%',
                textAlign: 'center',
                borderBottom: '2px solid',
                borderBottomColor: 'primary.main',
                py: 2,
              }}
            >
              Unit
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const product = item.product || item;
            const quantity = item.qty || item.quantity || 0;
            
            // Handle different unit formats
            const unitLabel = (() => {
              if (typeof product.unit === 'object' && product.unit !== null) {
                return product.unit.name || product.unit.nameVn || product.unit.nameEn || 'N/A';
              }
              return product.unit || product.unitNameVn || product.unitNameEn || 'N/A';
            })();

            return (
              <TableRow
                key={product.id || product.productId || index}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                  '&:hover': { 
                    bgcolor: '#f0f0f0',
                    transform: 'scale(1.001)',
                  },
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
              >
                {/* Product Name Column */}
                <TableCell sx={{ width: '50%', py: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      component="img"
                      src={
                        product?.image
                          ? `/uploads/product-img/${product.image}`
                          : '/placeholder-prod.png'
                      }
                      alt={product.name || 'Product'}
                      sx={{
                        width: 56,
                        height: 56,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                        bgcolor: 'grey.100',
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-prod.png';
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600} 
                        sx={{ 
                          wordBreak: 'break-word',
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name || 'Unknown Product'}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={`Item #${index + 1}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        {product.code && (
                          <Chip
                            label={product.code}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </TableCell>

                {/* Quantity Column */}
                <TableCell align="center" sx={{ width: '25%', py: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: 2,
                    }}
                  >
                    {quantity}
                  </Box>
                </TableCell>

                {/* Unit Column */}
                <TableCell align="center" sx={{ width: '25%', py: 2 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600}
                    sx={{
                      bgcolor: 'grey.100',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      display: 'inline-block',
                      minWidth: 60,
                    }}
                  >
                    {unitLabel}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Table Footer with Summary */}
      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid', borderTopColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Total Items: {items.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Quantity: {items.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0)}
          </Typography>
        </Stack>
      </Box>
    </TableContainer>
  );
};

OrderItemsTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        code: PropTypes.string,
        image: PropTypes.string,
        unit: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        unitNameVn: PropTypes.string,
        unitNameEn: PropTypes.string,
      }),
      qty: PropTypes.number,
      quantity: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

export default OrderItemsTable;