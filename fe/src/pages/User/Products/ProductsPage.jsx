// src/pages/User/Products/ProductsPage.jsx
import { useState, useEffect } from "react";
import { 
  Alert, 
  Box, 
  Breadcrumbs, 
  Typography, 
  Chip, 
  Stack, 
  Fade, 
  Paper, 
  Container,
  Slide,
  Grow,
  Zoom,
  CircularProgress,
  Skeleton,
  Snackbar,
  Button
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { categoryApi, productApi } from "services/api";
import { useCart } from "../../../context/CartContext/useCart";

import CategorySidebar from "components/categories/CategorySidebar";
import ToolbarFilter   from "components/shop/ToolbarFilter";
import ProductGrid     from "components/shop/ProductGrid";
import PaginationBar   from "components/shop/PaginationBar";
import "../../../css/pages/ProductsPage.css";
import "../../../css/animations/micro-interactions.css";

// Phase 4: Advanced Features Components
import RecentlyViewed from "components/advanced/RecentlyViewed";
import SavedSearches from "components/advanced/SavedSearches";
import BulkActionsToolbar from "components/advanced/BulkActionsToolbar";
import ProductComparisonModal from "components/advanced/ProductComparisonModal";

// Phase 4: Advanced Hooks
import { useUserPreferences } from "hooks/useUserPreferences";
import { useBulkActions } from "hooks/useBulkActions";
import { useProductComparison } from "hooks/useProductComparison";
import { useVirtualScroll } from "hooks/useVirtualScroll";

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const { i18n } = useTranslation();
  const pageParam = Number(params.get("page") ?? 0);
  const catParam  = params.getAll("categoryId").map(Number).filter(Boolean);
  const keyword   = params.get("q") ?? "";

  /* local UI state (view, size, sort) */
  const [view,     setView]     = useState(params.get("view")  ?? "grid");
  const [pageSize, setPageSize] = useState(Number(params.get("size") ?? 12));
  const [sort,     setSort]     = useState(params.get("sort")  ?? "default");

  /* Phase 3: Animation and feedback states */
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [filterAnimationKey, setFilterAnimationKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    products: false,
    filters: false
  });

  const { addItem } = useCart();

  /* queries */
  const { data: cats = [] } = useQuery({
    queryKey: ["cats", i18n.language],
    queryFn : categoryApi.all,
    staleTime: 60_000,
  });

  const {
    data: prodPage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", catParam, pageParam, pageSize, sort, keyword, i18n.language],
    queryFn : () =>
      productApi.listMultiCats(catParam, pageParam, pageSize, sort, keyword),
    keepPreviousData: true,
  });

  /* Phase 4: Advanced Features Hooks */
  const {
    preferences,
    savePreferences,
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    savedSearches,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    favorites,
    toggleFavorite,
    isFavorite,
    filterHistory,
    addToFilterHistory,
    getPopularFilters
  } = useUserPreferences();

  const {
    selectedItems,
    selectedItemsData,
    isSelectionMode,
    selectionStats,
    toggleSelectionMode,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    bulkActions
  } = useBulkActions(prodPage?.content || []);

  const {
    comparisonItems,
    comparisonData,
    comparisonStats,
    isComparisonOpen,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    isInComparison
  } = useProductComparison();

  const {
    visibleItems,
    totalHeight,
    setRef: setVirtualScrollRef,
    scrollToTop,
    isVirtualized
  } = useVirtualScroll({
    items: prodPage?.content || [],
    itemHeight: 350,
    containerHeight: 600,
    enabled: preferences.enableVirtualScroll && (prodPage?.content?.length || 0) > 50
  });

  /* Phase 3: Animation and feedback utilities */
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const triggerFilterAnimation = () => {
    setFilterAnimationKey(prev => prev + 1);
  };

  const withPageTransition = async (callback) => {
    setIsPageTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 150)); // Brief transition
    callback();
    setTimeout(() => setIsPageTransitioning(false), 300);
  };

  /* helpers for updating the URL params with animations */
  const mutateParams = (fn) =>
    setParams((p) => {
      fn(p);
      return p;
    });

  const toggleCategory = (id) => {
    const exists = catParam.includes(id);
    triggerFilterAnimation();
    mutateParams((p) => {
      p.delete("categoryId");
      (exists ? catParam.filter((c) => c !== id) : [...catParam, id])
        .forEach((c) => p.append("categoryId", c));
      p.set("page", 0);
    });
    showSnackbar(`Category ${exists ? 'removed' : 'added'} to filters`, 'info');
  };

  const selectSingleCategory = (id) => {
    triggerFilterAnimation();
    mutateParams((p) => {
      p.delete("categoryId");
      if (id !== null) p.append("categoryId", id);
      p.set("page", 0);
    });
    showSnackbar('Category filter updated', 'info');
  };

  const changePage = (v) => withPageTransition(() => mutateParams((p) => p.set("page", v)));
  const changeKeyword = (kw) => {
    triggerFilterAnimation();
    mutateParams((p) => { 
      kw ? p.set("q", kw) : p.delete("q"); 
      p.set("page", 0);
    });
    if (kw) showSnackbar(`Searching for "${kw}"`, 'info');
  };
  const changeSort = (s) => {
    triggerFilterAnimation();
    mutateParams((p) => { s!=="default" ? p.set("sort", s):p.delete("sort");});
    showSnackbar('Sort order updated', 'success');
  };
  const changePageSize = (s) => {
    triggerFilterAnimation();
    mutateParams((p) => p.set("size", s));
    showSnackbar(`Showing ${s} items per page`, 'info');
  };
  const changeView = (v) => {
    mutateParams((p) => { v!=="grid" ? p.set("view", v):p.delete("view");});
    showSnackbar(`View changed to ${v}`, 'success');
    savePreferences({ defaultView: v });
  };

  /* Phase 4: Advanced Features Functions */
  const handleProductClick = (product) => {
    addToRecentlyViewed(product);
    // Navigate to product detail page
    // navigate(`/products/${product.id}`);
  };

  const handleSaveCurrentSearch = (params, name) => {
    const searchParams = {
      q: keyword,
      categoryId: catParam,
      sort,
      pageSize,
      view
    };
    const saved = saveSearch(searchParams, name);
    if (saved) {
      showSnackbar(`Search "${name}" saved successfully`, 'success');
    }
  };

  const handleLoadSavedSearch = (search) => {
    const params = search.params;
    mutateParams((p) => {
      p.delete("q");
      p.delete("categoryId");
      p.delete("sort");
      p.delete("size");
      p.delete("view");
      p.delete("page");

      if (params.q) p.set("q", params.q);
      if (params.categoryId?.length) {
        params.categoryId.forEach(id => p.append("categoryId", id));
      }
      if (params.sort && params.sort !== "default") p.set("sort", params.sort);
      if (params.pageSize) p.set("size", params.pageSize);
      if (params.view && params.view !== "grid") p.set("view", params.view);
      p.set("page", 0);
    });
    
    setSort(params.sort || "default");
    setPageSize(params.pageSize || 12);
    setView(params.view || "grid");
    
    loadSavedSearch(search.id);
    showSnackbar(`Loaded search "${search.name}"`, 'success');
  };

  const handleBulkAddToCart = () => {
    const items = bulkActions.addToCart(1);
    items.forEach(item => addItem(item, item.quantity));
    showSnackbar(`Added ${items.length} items to cart`, 'success');
    clearSelection();
  };

  const handleBulkAddToFavorites = () => {
    const items = bulkActions.addToFavorites();
    items.forEach(item => toggleFavorite(item));
    showSnackbar(`Added ${items.length} items to favorites`, 'success');
    clearSelection();
  };

  const handleBulkCompare = () => {
    const items = bulkActions.compare();
    items.forEach(item => addToComparison(item));
    toggleComparison();
    showSnackbar(`Added ${items.length} items to comparison`, 'success');
    clearSelection();
  };

  const handleBulkExport = (format) => {
    const data = bulkActions.export(format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar(`Exported ${selectedItems.length} items as ${format.toUpperCase()}`, 'success');
  };

  const handleAddToCart = (product, quantity = 1) => {
    addItem(product, quantity);
    showSnackbar(`${product.name} added to cart!`, 'success');
  };

  // Track filter usage
  useEffect(() => {
    const filterState = {
      categoryId: catParam,
      sort,
      keyword,
      view,
      pageSize
    };
    addToFilterHistory(filterState);
  }, [catParam, sort, keyword, view, pageSize, addToFilterHistory]);

  // Load user preferences on mount
  useEffect(() => {
    if (preferences.defaultView !== view) {
      setView(preferences.defaultView);
    }
    if (preferences.defaultPageSize !== pageSize) {
      setPageSize(preferences.defaultPageSize);
    }
    if (preferences.defaultSort !== sort) {
      setSort(preferences.defaultSort);
    }
  }, [preferences]);

  if (error) return <Alert severity="error">{error.message}</Alert>;

  /* ============================== render ============================== */
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 6,
      }}
    >
      {/* ---------- sidebar ---------- */}
      <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0 }}>
        <CategorySidebar
          list={cats}
          active={catParam}
          onSelect={selectSingleCategory}
        />
      </Box>

      {/* ---------- main ---------- */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <ToolbarFilter
          keyword={keyword}
          setKeyword={changeKeyword}
          view={view}
          setView={(v) => { setView(v); changeView(v); }}
          pageSize={pageSize}
          setPageSize={(s) => { setPageSize(s); changePageSize(s); }}
          sort={sort}
          setSort={(s) => { setSort(s); changeSort(s); }}
          categories={cats}
          selectedCats={catParam}
          onToggleCat={toggleCategory}
          totalProducts={prodPage?.totalElements || prodPage?.content?.length || 0}
          currentPageProducts={prodPage?.content?.length || 0}
        />

        <ProductGrid
          products={prodPage?.content ?? []}
          loading={isLoading}
          view={view}
          onAddToCart={(p, q) => addItem(p, q)}
        />

        {prodPage && (
          <PaginationBar
            page={pageParam}
            totalPages={prodPage.totalPages}
            onPageChange={changePage}
            pageSize={pageSize}
            setPageSize={(s) => { setPageSize(s); changePageSize(s); }}
          />
        )}
      </Box>
    </Box>
  );
}