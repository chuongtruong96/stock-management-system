// Phase 4: Bulk Actions Toolbar Component
import React, { useState } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Checkbox,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Fade,
  Slide,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Compare as CompareIcon,
  FileDownload as DownloadIcon,
  MoreVert as MoreIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const BulkActionsToolbar = ({
  isVisible = false,
  selectedCount = 0,
  totalCount = 0,
  isAllSelected = false,
  isPartiallySelected = false,
  onSelectAll,
  onClearSelection,
  onClose,
  onBulkAddToCart,
  onBulkAddToFavorites,
  onBulkCompare,
  onBulkExport,
  maxCompareItems = 4
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setExportAnchorEl(null);
  };

  const handleBulkAction = (action, ...args) => {
    handleClose();
    action?.(...args);
  };

  if (!isVisible) return null;

  return (
    <Slide direction="up" in={isVisible} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Toolbar
          sx={{
            minHeight: '64px !important',
            px: { xs: 2, sm: 3 },
            color: 'white'
          }}
        >
          {/* Selection Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            {/* Select All Checkbox */}
            <Tooltip title={isAllSelected ? 'Deselect all' : 'Select all'}>
              <Checkbox
                checked={isAllSelected}
                indeterminate={isPartiallySelected}
                onChange={onSelectAll}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&.Mui-checked': { color: 'white' },
                  '&.MuiCheckbox-indeterminate': { color: 'white' }
                }}
              />
            </Tooltip>

            {/* Selection Info */}
            <Box>
              <Typography variant="h6" fontWeight="600">
                {selectedCount} selected
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {selectedCount} of {totalCount} items
              </Typography>
            </Box>

            {/* Selection Progress */}
            <Chip
              label={`${Math.round((selectedCount / totalCount) * 100)}%`}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: '600'
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Add to Cart */}
            <Tooltip title="Add selected to cart">
              <Button
                variant="contained"
                startIcon={<CartIcon />}
                onClick={() => handleBulkAction(onBulkAddToCart)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                Add to Cart
              </Button>
            </Tooltip>

            {/* Add to Favorites */}
            <Tooltip title="Add selected to favorites">
              <IconButton
                onClick={() => handleBulkAction(onBulkAddToFavorites)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <FavoriteIcon />
              </IconButton>
            </Tooltip>

            {/* Compare */}
            <Tooltip title={`Compare selected (max ${maxCompareItems})`}>
              <IconButton
                onClick={() => handleBulkAction(onBulkCompare)}
                disabled={selectedCount > maxCompareItems}
                sx={{
                  color: selectedCount > maxCompareItems ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <CompareIcon />
              </IconButton>
            </Tooltip>

            {/* Export */}
            <Tooltip title="Export selected">
              <IconButton
                onClick={handleExportClick}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', mx: 1 }} />

            {/* Clear Selection */}
            <Tooltip title="Clear selection">
              <IconButton
                onClick={onClearSelection}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>

            {/* Close */}
            <Tooltip title="Close bulk actions">
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    color: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>

        {/* Export Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              mt: -1
            }
          }}
        >
          <MenuItem onClick={() => handleBulkAction(onBulkExport, 'json')}>
            Export as JSON
          </MenuItem>
          <MenuItem onClick={() => handleBulkAction(onBulkExport, 'csv')}>
            Export as CSV
          </MenuItem>
        </Menu>
      </Box>
    </Slide>
  );
};

export default BulkActionsToolbar;