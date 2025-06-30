import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  useTheme
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const NotificationFilters = ({
  filters,
  sortBy,
  onFilterChange,
  onSortChange
}) => {
  const { t } = useTranslation('notifications');
  const theme = useTheme();
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  const filterOptions = [
    { key: 'all', label: t('all') },
    { key: 'unread', label: t('unread') },
    { key: 'read', label: t('read') }
  ];

  const typeOptions = [
    { key: 'all', label: t('all') },
    { key: 'order', label: t('notificationTypes.order') },
    { key: 'system', label: t('notificationTypes.system') },
    { key: 'promotion', label: t('notificationTypes.promotion') },
    { key: 'reminder', label: t('notificationTypes.reminder') },
    { key: 'alert', label: t('notificationTypes.alert') },
    { key: 'update', label: t('notificationTypes.update') }
  ];

  const priorityOptions = [
    { key: 'all', label: t('all') },
    { key: 'urgent', label: t('urgent') },
    { key: 'high', label: t('high') },
    { key: 'medium', label: t('medium') },
    { key: 'low', label: t('low') },
    { key: 'normal', label: t('normal') }
  ];

  const sortOptions = [
    { key: 'newest', label: t('newest') },
    { key: 'oldest', label: t('oldest') },
    { key: 'priority', label: t('priority') },
    { key: 'type', label: t('type') },
    { key: 'read', label: t('readStatus') }
  ];

  const timeRangeOptions = [
    { key: 'all', label: t('allTime') },
    { key: 'today', label: t('today') },
    { key: 'yesterday', label: t('yesterday') },
    { key: 'thisWeek', label: t('thisWeek') },
    { key: 'lastWeek', label: t('lastWeek') },
    { key: 'thisMonth', label: t('thisMonth') },
    { key: 'lastMonth', label: t('lastMonth') }
  ];

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== null && value !== undefined
  ).length;

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleClearFilters = () => {
    onFilterChange('status', 'all');
    onFilterChange('type', 'all');
    onFilterChange('priority', 'all');
    onFilterChange('timeRange', 'all');
    handleFilterMenuClose();
  };

  const renderFilterChips = () => {
    const chips = [];
    
    if (filters.status !== 'all') {
      chips.push(
        <Chip
          key="status"
          label={`${t('status')}: ${t(filters.status)}`}
          onDelete={() => handleFilterChange('status', 'all')}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    
    if (filters.type !== 'all') {
      chips.push(
        <Chip
          key="type"
          label={`${t('type')}: ${t(`notificationTypes.${filters.type}`)}`}
          onDelete={() => handleFilterChange('type', 'all')}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    
    if (filters.priority !== 'all') {
      chips.push(
        <Chip
          key="priority"
          label={`${t('priority')}: ${t(filters.priority)}`}
          onDelete={() => handleFilterChange('priority', 'all')}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    
    if (filters.timeRange !== 'all') {
      chips.push(
        <Chip
          key="timeRange"
          label={`${t('time')}: ${t(filters.timeRange)}`}
          onDelete={() => handleFilterChange('timeRange', 'all')}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    
    return chips;
  };

  return (
    <Box>
      <Box display="flex" gap={1} alignItems="center">
        {/* Filter Button */}
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          endIcon={<ArrowDownIcon />}
          onClick={handleFilterMenuOpen}
          sx={{
            position: 'relative',
            '&::after': activeFiltersCount > 0 ? {
              content: `"${activeFiltersCount}"`,
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            } : {}
          }}
        >
          {t('filterBy')}
        </Button>

        {/* Sort Button */}
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          endIcon={<ArrowDownIcon />}
          onClick={handleSortMenuOpen}
        >
          {t('sortBy')}: {t(sortBy)}
        </Button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <IconButton
            size="small"
            onClick={handleClearFilters}
            sx={{ color: 'text.secondary' }}
          >
            <ClearIcon />
          </IconButton>
        )}
      </Box>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          {renderFilterChips()}
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          sx: { minWidth: 280, maxWidth: 320 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('filterBy')}
          </Typography>

          {/* Status Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t('status')}</InputLabel>
            <Select
              value={filters.status}
              label={t('status')}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {filterOptions.map(option => (
                <MenuItem key={option.key} value={option.key}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    {option.label}
                    {filters.status === option.key && <CheckIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Type Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t('type')}</InputLabel>
            <Select
              value={filters.type}
              label={t('type')}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              {typeOptions.map(option => (
                <MenuItem key={option.key} value={option.key}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    {option.label}
                    {filters.type === option.key && <CheckIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t('priority')}</InputLabel>
            <Select
              value={filters.priority}
              label={t('priority')}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <MenuItem key={option.key} value={option.key}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    {option.label}
                    {filters.priority === option.key && <CheckIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Time Range Filter */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{t('timeRange')}</InputLabel>
            <Select
              value={filters.timeRange}
              label={t('timeRange')}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            >
              {timeRangeOptions.map(option => (
                <MenuItem key={option.key} value={option.key}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    {option.label}
                    {filters.timeRange === option.key && <CheckIcon sx={{ ml: 1, fontSize: 16 }} />}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
            >
              {t('clearAll')}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleFilterMenuClose}
            >
              {t('apply')}
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
      >
        {sortOptions.map(option => (
          <MenuItem
            key={option.key}
            onClick={() => {
              onSortChange(option.key);
              handleSortMenuClose();
            }}
            selected={sortBy === option.key}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              {option.label}
              {sortBy === option.key && <CheckIcon sx={{ ml: 1, fontSize: 16 }} />}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default NotificationFilters;