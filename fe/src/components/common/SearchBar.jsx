import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getCategoryNameSimple } from "utils/categoryNameUtils";
import { productApi, categoryApi } from "services/api";
import { getProductImageUrl } from "utils/apiUtils";

const SearchBar = ({ placeholder, onSearch, fullWidth = true, size = "medium" }) => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search suggestions query
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["searchSuggestions", query, i18n.language],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      const [products, categories] = await Promise.all([
        productApi.list(null, 0, 5, "default", query),
        categoryApi.all(),
      ]);

      const productSuggestions = products.content.map(p => ({
        type: "product",
        id: p.id,
        title: p.name,
        subtitle: p.category?.name || t('search.product'),
        image: p.image,
      }));

      const categorySuggestions = categories
        .filter(c => 
          c.nameEn?.toLowerCase().includes(query.toLowerCase()) ||
          c.nameVn?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map(c => ({
          type: "category",
          id: c.categoryId,
          title: getCategoryNameSimple(c, i18n.language),
          subtitle: t('search.category'),
          image: c.icon,
        }));

      return [...productSuggestions, ...categorySuggestions];
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));

    // Navigate to search results
    navigate(`/products?page=0&q=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    setQuery("");
    
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "product") {
      navigate(`/products/${suggestion.id}`);
    } else if (suggestion.type === "category") {
      navigate(`/products?page=0&categoryId=${suggestion.id}`);
    }
    setShowSuggestions(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
      <TextField
        ref={searchRef}
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder || t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          },
        }}
      />

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <Fade in timeout={200}>
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 1,
              borderRadius: 2,
              maxHeight: 400,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Loading State */}
            {isLoading && query.length >= 2 && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('search.searching')}
                </Typography>
              </Box>
            )}

            {/* Search Suggestions */}
            {!isLoading && suggestions.length > 0 && (
              <Box>
                <Typography
                  variant="overline"
                  sx={{ px: 2, py: 1, display: "block", fontWeight: 600 }}
                >
                  {t('search.suggestions')}
                </Typography>
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem
                      key={`${suggestion.type}-${suggestion.id}`}
                      button
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={suggestion.image ? getProductImageUrl(suggestion.image) : undefined}
                          sx={{ width: 32, height: 32 }}
                        >
                          {suggestion.title.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={suggestion.title}
                        secondary={
                          <Chip
                            label={suggestion.subtitle}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Recent Searches */}
            {!isLoading && query.length < 2 && recentSearches.length > 0 && (
              <Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="overline" fontWeight={600}>
                    {t('search.recentSearches')}
                  </Typography>
                  <IconButton size="small" onClick={clearRecentSearches}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
                <List dense>
                  {recentSearches.map((search, index) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => handleSearch(search)}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "grey.100" }}>
                          <HistoryIcon fontSize="small" color="action" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={search} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {t('search.noResults', { query })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('search.tryDifferent')}
                </Typography>
              </Box>
            )}

            {/* Empty State */}
            {query.length < 2 && recentSearches.length === 0 && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <TrendingIcon color="action" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('search.startTyping')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Fade>
      )}

      {/* Backdrop to close suggestions */}
      {showSuggestions && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
          }}
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </Box>
  );
};

export default SearchBar;