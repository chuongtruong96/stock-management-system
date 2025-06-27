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
  const { t } = useTranslation();
  const [showCategories, setShowCategories] = useState(false);

  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "nameAsc", label: "Name A–Z", icon: "🔤" },
    { value: "nameDesc", label: "Name Z–A", icon: "🔤" },
    { value: "priceAsc", label: "Price ↑", icon: "💰" },
    { value: "priceDesc", label: "Price ↓", icon: "💰" },
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap' }}
              >
                {totalProducts} products found
              </Typography>

              {/* Controls */}
              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={2} 
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                {/* Page Size */}
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "space-between", sm: "flex-start" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    Show:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={pageSize}
                    onChange={(_, v) => v && setPageSize(v)}
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        px: 2,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
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
                <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                  <Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                      },
                    }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.icon && <span>{option.icon}</span>}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Language Toggle */}
                <LanguageToggle size="small" />

                {/* View Toggle */}
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={view}
                  onChange={(_, v) => v && setView(v)}
                  sx={{
                    '& .MuiToggleButton-root': {
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: 'secondary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'secondary.dark',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid">
                    <Tooltip title="Grid View">
                      <ViewModuleIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="list">
                    <Tooltip title="List View">
                      <ViewListIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Stack>

          {/* Category Filter Toggle */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              endIcon={
                <Badge badgeContent={selectedCats.length} color="secondary">
                  {showCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Badge>
              }
              onClick={() => setShowCategories(!showCategories)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                },
              }}
            >
              Category Filters
            </Button>

            {hasActiveFilters && (
              <Button
                variant="text"
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    bgcolor: 'error.light',
                  },
                }}
              >
                Clear All
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Category Filters */}
      <Collapse in={showCategories}>
        <Divider />
        <Box sx={{ p: 2.5, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Filter by Categories
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              maxHeight: 200,
              overflowY: "auto",
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 3,
              },
            }}
          >
            {categories.map((c) => {
              const selected = selectedCats.includes(c.categoryId);
              const categoryName = c.nameEn || c.nameVn || c.code;
              
              return (
                <Chip
                  key={c.categoryId}
                  label={categoryName}
                  color={selected ? "secondary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => onToggleCat(c.categoryId)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: selected ? 600 : 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}