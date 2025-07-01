// Phase 4: Saved Searches Component
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fade,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const SavedSearches = ({ 
  savedSearches = [], 
  onLoadSearch, 
  onDeleteSearch, 
  onSaveCurrentSearch,
  currentSearchParams = {},
  filterHistory = []
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [editingSearch, setEditingSearch] = useState(null);

  const handleSaveSearch = () => {
    if (searchName.trim()) {
      onSaveCurrentSearch?.(currentSearchParams, searchName.trim());
      setSearchName('');
      setSaveDialogOpen(false);
    }
  };

  const handleEditSearch = (search) => {
    setEditingSearch(search);
    setSearchName(search.name);
    setSaveDialogOpen(true);
  };

  const formatSearchParams = (params) => {
    const parts = [];
    if (params.q) parts.push(`"${params.q}"`);
    if (params.categoryId?.length) parts.push(`${params.categoryId.length} categories`);
    if (params.sort && params.sort !== 'default') parts.push(`sorted by ${params.sort}`);
    return parts.join(', ') || 'All products';
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPopularSearches = () => {
    return filterHistory
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Saved Searches
          </Typography>
          <Chip 
            label={savedSearches.length} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          Save Current
        </Button>
      </Box>

      {/* Popular Searches */}
      {getPopularSearches().length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Popular Searches
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {getPopularSearches().map((search, index) => (
              <Chip
                key={search.id}
                label={formatSearchParams(search.filters)}
                size="small"
                variant="outlined"
                clickable
                onClick={() => onLoadSearch?.(search)}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    borderColor: 'primary.main'
                  }
                }}
              />
            ))}
          </Stack>
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}

      {/* Saved Searches List */}
      {savedSearches.length === 0 ? (
        <Card 
          elevation={0} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(103, 126, 234, 0.02) 100%)',
            border: '1px dashed rgba(103, 126, 234, 0.2)'
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No saved searches yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Save your current search to quickly access it later
          </Typography>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {savedSearches.map((search, index) => (
            <Fade in={true} timeout={300 + index * 100} key={search.id}>
              <Card
                elevation={1}
                sx={{
                  mb: 1,
                  transition: 'all 0.3s ease-out',
                  '&:hover': {
                    elevation: 3,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                  }
                }}
              >
                <ListItem
                  button
                  onClick={() => onLoadSearch?.(search)}
                  sx={{ p: 2 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600">
                        {search.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {formatSearchParams(search.params)}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Saved {formatTimeAgo(search.savedAt)}
                          </Typography>
                          {search.usageCount > 0 && (
                            <Chip
                              label={`Used ${search.usageCount} times`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit search name">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSearch(search);
                          }}
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete search">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSearch?.(search.id);
                          }}
                          sx={{ 
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </Card>
            </Fade>
          ))}
        </List>
      )}

      {/* Save Search Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => {
          setSaveDialogOpen(false);
          setEditingSearch(null);
          setSearchName('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SaveIcon color="primary" />
          {editingSearch ? 'Edit Search Name' : 'Save Current Search'}
          <IconButton
            onClick={() => {
              setSaveDialogOpen(false);
              setEditingSearch(null);
              setSearchName('');
            }}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current search: {formatSearchParams(currentSearchParams)}
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            fullWidth
            label="Search Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter a name for this search..."
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setSaveDialogOpen(false);
              setEditingSearch(null);
              setSearchName('');
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSearch}
            variant="contained"
            disabled={!searchName.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {editingSearch ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedSearches;