import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Select,
  MenuItem,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../common/LanguageToggle";
import { getCategoryNameSimple } from "utils/categoryNameUtils";

export default function ToolbarFilter({
  keyword,
  setKeyword,
  view,
  setView,
  pageSize,
  setPageSize,
  sort,
  setSort,
  categories,
  selectedCats,
  onToggleCat,
  totalProducts = 0,
}) {
  const { t, i18n } = useTranslation();
  const [showCategories, setShowCategories] = useState(false);

  const sortOptions = [
    { value: "default", label: t('sort.default') || "Default" },
    { value: "nameAsc", label: t('sort.nameAsc') || "Name A–Z", icon: "🔤" },
    { value: "nameDesc", label: t('sort.nameDesc') || "Name Z–A", icon: "🔤" },
    
  ];

  const pageSizeOptions = [9, 12, 15, 24];

  const clearAllFilters = () => {
    setKeyword("");
    selectedCats.forEach(catId => onToggleCat(catId));
    setSort("default");
  };

  const hasActiveFilters = keyword || selectedCats.length > 0 || sort !== "default";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        mb: 3,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Main Toolbar */}
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={3}>
          {/* Top Row - Search and Controls */}
          <Stack spacing={2}>
            {/* Search */}
            <TextField
              placeholder={t('common.search') + " products..."}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{
                width: "100%",
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: keyword && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setKeyword("")}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Controls Row */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              {/* Results Count */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  <strong>{totalProducts.toLocaleString()}</strong> {t('common.productsFound') || 'products found'}
                </Typography>
                {hasActiveFilters && (
                  <Chip
                    label={t('common.filtered') || 'Filtered'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>

              {/* Controls */}
              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={2} 
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                {/* Page Size */}
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "space-between", sm: "flex-start" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {t('common.show') || 'Show'}:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={pageSize}
                    onChange={(_, v) => v && setPageSize(v)}
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        px: 1.5,
                        minWidth: 36,
                        fontSize: '0.8rem',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    {pageSizeOptions.map((n) => (
                      <ToggleButton key={n} value={n}>
                        {n}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Stack>

                {/* Sort */}
                <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
                  <Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      fontSize: '0.85rem',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        py: 1,
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.icon && <span style={{ fontSize: '0.9rem' }}>{option.icon}</span>}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Language Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LanguageToggle size="small" />
                </Box>

                {/* View Toggle */}
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={view}
                  onChange={(_, v) => v && setView(v)}
                  sx={{
                    '& .MuiToggleButton-root': {
                      borderRadius: 2,
                      px: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'secondary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'secondary.dark',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'secondary.light',
                        color: 'secondary.main',
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid">
                    <Tooltip title={t('view.grid') || 'Grid View'}>
                      <ViewModuleIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="list">
                    <Tooltip title={t('view.list') || 'List View'}>
                      <ViewListIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Stack>

          {/* Category Filter Toggle */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              endIcon={
                <Badge 
                  badgeContent={selectedCats.length} 
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      minWidth: 16,
                      height: 16,
                    }
                  }}
                >
                  {showCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Badge>
              }
              onClick={() => setShowCategories(!showCategories)}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                borderColor: selectedCats.length > 0 ? 'secondary.main' : 'divider',
                color: selectedCats.length > 0 ? 'secondary.main' : 'text.primary',
                bgcolor: selectedCats.length > 0 ? 'secondary.light' : 'transparent',
                fontWeight: selectedCats.length > 0 ? 600 : 500,
                px: 2.5,
                py: 1,
                '&:hover': {
                  borderColor: 'secondary.main',
                  bgcolor: 'secondary.light',
                  color: 'secondary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {t('common.categoryFilters') || 'Category Filters'}
            </Button>

            <Stack direction="row" spacing={1} alignItems="center">
              {hasActiveFilters && (
                <Button
                  variant="text"
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    borderRadius: 2,
                    px: 2,
                    fontSize: '0.85rem',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: 'error.light',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {t('common.clearAll') || 'Clear All'}
                </Button>
              )}
              
              {/* Quick stats */}
              {selectedCats.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {selectedCats.length} {t('common.selected') || 'selected'}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* Category Filters */}
      <Collapse in={showCategories} timeout={300}>
        <Divider sx={{ borderColor: 'divider' }} />
        <Box sx={{ 
          p: 3, 
          bgcolor: 'linear-gradient(135deg, rgba(248,249,250,0.8) 0%, rgba(255,255,255,0.9) 100%)',
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon fontSize="small" color="secondary" />
                {t('common.filterByCategories') || 'Filter by Categories'}
              </Typography>
              
              {categories.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {categories.length} {t('common.available') || 'available'}
                </Typography>
              )}
            </Stack>
            
            {categories.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 3,
                color: 'text.secondary',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}>
                <Typography variant="body2">
                  {t('common.noCategoriesAvailable') || 'No categories available'}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  maxHeight: 240,
                  overflowY: "auto",
                  p: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&::-webkit-scrollbar': {
                    width: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 4,
                    '&:hover': {
                      background: 'rgba(0,0,0,0.3)',
                    },
                  },
                }}
              >
                {categories.map((c) => {
                  const selected = selectedCats.includes(c.categoryId);
                  
                  // Use the utility function to get the correct name based on language
                  const categoryName = getCategoryNameSimple(c, i18n.language);
                  
                  return (
                    <Chip
                      key={c.categoryId}
                      label={categoryName}
                      color={selected ? "secondary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                      onClick={() => onToggleCat(c.categoryId)}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: selected ? 600 : 500,
                        fontSize: '0.85rem',
                        px: 1,
                        py: 0.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: selected 
                            ? '0 4px 12px rgba(156, 39, 176, 0.3)' 
                            : '0 4px 12px rgba(0,0,0,0.15)',
                          borderColor: selected ? 'secondary.main' : 'primary.main',
                        },
                        '&:active': {
                          transform: 'translateY(0px)',
                        },
                        ...(selected && {
                          boxShadow: '0 2px 8px rgba(156, 39, 176, 0.2)',
                        }),
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}