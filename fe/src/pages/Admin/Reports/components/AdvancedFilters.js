import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  Autocomplete,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  DateRange as DateRangeIcon,
  Category as CategoryIcon,
  Business as DepartmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { reportApi } from 'services/api';

export default function AdvancedFilters({ 
  onFiltersChange, 
  onSaveFilter, 
  savedFilters = [], 
  loading = false 
}) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    departments: [],
    categories: [],
    products: [],
    minQuantity: null,
    maxQuantity: null,
    startDate: null,
    endDate: null,
    useCustomDateRange: false,
  });

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    categories: [],
    quantityRanges: [],
    datePresets: [],
  });

  const [expanded, setExpanded] = useState({
    basic: true,
    departments: false,
    categories: false,
    quantity: false,
    dateRange: false,
  });

  const [filterName, setFilterName] = useState('');
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Update applied filters count
  useEffect(() => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === 'year' || key === 'month') return acc; // Don't count basic filters
      if (Array.isArray(value) && value.length > 0) return acc + 1;
      if (value !== null && value !== undefined && value !== '') return acc + 1;
      return acc;
    }, 0);
    setAppliedFiltersCount(count);
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const options = await reportApi.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
      toast.error('Failed to load filter options');
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev => ({ ...prev, [panel]: isExpanded }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      departments: [],
      categories: [],
      products: [],
      minQuantity: null,
      maxQuantity: null,
      startDate: null,
      endDate: null,
      useCustomDateRange: false,
    };
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
    toast.success(t('filtersCleared') || 'Filters cleared');
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) {
      toast.error(t('pleaseEnterFilterName') || 'Please enter a filter name');
      return;
    }

    const filterToSave = {
      name: filterName,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    if (onSaveFilter) {
      onSaveFilter(filterToSave);
    }
    
    setFilterName('');
    toast.success(t('filterSaved') || 'Filter saved successfully');
  };

  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    if (onFiltersChange) {
      onFiltersChange(savedFilter.filters);
    }
    toast.success(t('filterLoaded') || `Filter "${savedFilter.name}" loaded`);
  };

  const applyQuickFilter = (preset) => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (preset.days) {
      startDate.setDate(startDate.getDate() - preset.days);
    } else if (preset.months) {
      startDate.setMonth(startDate.getMonth() - preset.months);
    } else if (preset.years) {
      startDate.setFullYear(startDate.getFullYear() - preset.years);
    }

    const newFilters = {
      ...filters,
      startDate,
      endDate,
      useCustomDateRange: true,
    };

    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
    toast.success(t('quickFilterApplied') || `Applied: ${preset.label}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <FilterIcon color="primary" />
              <Typography variant="h6" fontWeight="600">
                {t('advancedFilters') || 'Advanced Filters'}
              </Typography>
              {appliedFiltersCount > 0 && (
                <Chip 
                  label={`${appliedFiltersCount} ${t('filtersApplied') || 'filters applied'}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title={t('clearAllFilters') || 'Clear All Filters'}>
                <IconButton onClick={clearAllFilters} size="small">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Quick Filters */}
          {filterOptions.datePresets?.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                {t('quickFilters') || 'Quick Filters'}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {filterOptions.datePresets.map((preset, index) => (
                  <Chip
                    key={index}
                    label={preset.label}
                    onClick={() => applyQuickFilter(preset)}
                    variant="outlined"
                    size="small"
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Basic Filters */}
          <Accordion 
            expanded={expanded.basic} 
            onChange={handleAccordionChange('basic')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="500">
                {t('basicFilters') || 'Basic Filters'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#000000' }}>{t('year') || 'Year'}</InputLabel>
                    <Select
                      value={filters.year}
                      label={t('year') || 'Year'}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      sx={{
                        '& .MuiSelect-select': {
                          color: '#000000', // Black text color
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#000000', // Black border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#333333', // Darker border on hover
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main', // Primary color when focused
                        }
                      }}
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <MenuItem 
                          key={year} 
                          value={year}
                          sx={{ color: '#000000' }} // Black text in dropdown items
                        >
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#000000' }}>{t('month') || 'Month'}</InputLabel>
                    <Select
                      value={filters.month}
                      label={t('month') || 'Month'}
                      onChange={(e) => handleFilterChange('month', e.target.value)}
                      sx={{
                        '& .MuiSelect-select': {
                          color: '#000000', // Black text color
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#000000', // Black border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#333333', // Darker border on hover
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main', // Primary color when focused
                        }
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <MenuItem 
                          key={month} 
                          value={month}
                          sx={{ color: '#000000' }} // Black text in dropdown items
                        >
                          {new Date(2024, month - 1, 1).toLocaleDateString('en', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Department Filters */}
          <Accordion 
            expanded={expanded.departments} 
            onChange={handleAccordionChange('departments')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <DepartmentIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="500">
                  {t('departmentFilters') || 'Department Filters'}
                </Typography>
                {filters.departments.length > 0 && (
                  <Chip label={filters.departments.length} size="small" color="primary" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={filterOptions.departments || []}
                value={filters.departments}
                onChange={(event, newValue) => handleFilterChange('departments', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('selectDepartments') || 'Select Departments'}
                    placeholder={t('chooseDepartments') || 'Choose departments...'}
                    InputLabelProps={{
                      sx: { color: '#000000' }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: '#000000', // Black text color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Black border
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333', // Darker border on hover
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main', // Primary color when focused
                      }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
              />
            </AccordionDetails>
          </Accordion>

          {/* Category Filters */}
          <Accordion 
            expanded={expanded.categories} 
            onChange={handleAccordionChange('categories')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <CategoryIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="500">
                  {t('categoryFilters') || 'Category Filters'}
                </Typography>
                {filters.categories.length > 0 && (
                  <Chip label={filters.categories.length} size="small" color="secondary" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={filterOptions.categories?.common || []}
                value={filters.categories}
                onChange={(event, newValue) => handleFilterChange('categories', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('selectCategories') || 'Select Categories'}
                    placeholder={t('chooseCategories') || 'Choose categories...'}
                    InputLabelProps={{
                      sx: { color: '#000000' }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: '#000000', // Black text color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Black border
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333', // Darker border on hover
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main', // Primary color when focused
                      }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="secondary"
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
              />
            </AccordionDetails>
          </Accordion>

          {/* Quantity Filters */}
          <Accordion 
            expanded={expanded.quantity} 
            onChange={handleAccordionChange('quantity')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="500">
                {t('quantityFilters') || 'Quantity Filters'}
              </Typography>
              {(filters.minQuantity || filters.maxQuantity) && (
                <Chip 
                  label={`${filters.minQuantity || 0} - ${filters.maxQuantity || '∞'}`}
                  size="small" 
                  color="success" 
                  sx={{ ml: 1 }}
                />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('minimumQuantity') || 'Minimum Quantity'}
                    value={filters.minQuantity || ''}
                    onChange={(e) => handleFilterChange('minQuantity', e.target.value ? parseInt(e.target.value) : null)}
                    inputProps={{ min: 0 }}
                    InputLabelProps={{
                      sx: { color: '#000000' }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: '#000000', // Black text color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Black border
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333', // Darker border on hover
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main', // Primary color when focused
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('maximumQuantity') || 'Maximum Quantity'}
                    value={filters.maxQuantity || ''}
                    onChange={(e) => handleFilterChange('maxQuantity', e.target.value ? parseInt(e.target.value) : null)}
                    inputProps={{ min: 0 }}
                    InputLabelProps={{
                      sx: { color: '#000000' }
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        color: '#000000', // Black text color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000', // Black border
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333333', // Darker border on hover
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main', // Primary color when focused
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('quickQuantityRanges') || 'Quick Quantity Ranges'}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {filterOptions.quantityRanges?.map((range, index) => (
                      <Chip
                        key={index}
                        label={range.label}
                        onClick={() => {
                          handleFilterChange('minQuantity', range.min);
                          handleFilterChange('maxQuantity', range.max);
                        }}
                        variant="outlined"
                        size="small"
                        clickable
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Date Range Filters */}
          <Accordion 
            expanded={expanded.dateRange} 
            onChange={handleAccordionChange('dateRange')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <DateRangeIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight="500">
                  {t('customDateRange') || 'Custom Date Range'}
                </Typography>
                {filters.useCustomDateRange && (
                  <Chip label={t('active') || 'Active'} size="small" color="info" />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.useCustomDateRange}
                        onChange={(e) => handleFilterChange('useCustomDateRange', e.target.checked)}
                      />
                    }
                    label={t('useCustomDateRange') || 'Use Custom Date Range'}
                  />
                </Grid>
                {filters.useCustomDateRange && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label={t('startDate') || 'Start Date'}
                        value={filters.startDate}
                        onChange={(date) => handleFilterChange('startDate', date)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            InputLabelProps={{
                              sx: { color: '#000000' }
                            }}
                            sx={{
                              '& .MuiInputBase-input': {
                                color: '#000000', // Black text color
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#000000', // Black border
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#333333', // Darker border on hover
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main', // Primary color when focused
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label={t('endDate') || 'End Date'}
                        value={filters.endDate}
                        onChange={(date) => handleFilterChange('endDate', date)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            InputLabelProps={{
                              sx: { color: '#000000' }
                            }}
                            sx={{
                              '& .MuiInputBase-input': {
                                color: '#000000', // Black text color
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#000000', // Black border
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#333333', // Darker border on hover
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main', // Primary color when focused
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Save/Load Filters */}
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('saveLoadFilters') || 'Save & Load Filters'}
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('filterName') || 'Filter Name'}
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder={t('enterFilterName') || 'Enter filter name...'}
                  InputLabelProps={{
                    sx: { color: '#000000' }
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: '#000000', // Black text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000', // Black border
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333333', // Darker border on hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main', // Primary color when focused
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={saveCurrentFilter}
                  disabled={!filterName.trim() || loading}
                >
                  {t('saveFilter') || 'Save Filter'}
                </Button>
              </Grid>
            </Grid>

            {savedFilters.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {t('savedFilters') || 'Saved Filters'}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {savedFilters.map((savedFilter, index) => (
                    <Chip
                      key={index}
                      label={savedFilter.name}
                      onClick={() => loadSavedFilter(savedFilter)}
                      onDelete={() => {/* Handle delete */}}
                      variant="outlined"
                      size="small"
                      clickable
                      icon={<RestoreIcon />}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Filter Summary */}
          {appliedFiltersCount > 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                {t('filtersAppliedSummary', { count: appliedFiltersCount }) || 
                 `${appliedFiltersCount} advanced filters are currently applied. This may affect the data displayed in reports.`}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}