import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  LocalOffer as OfferIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Favorite as FavoriteIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { categoryApi, productApi } from "services/api";
import { useCart } from "context/CartContext/useCart";
import SectionTitle from "components/common/SectionTitle";
import CategoryGridCompact from "components/categories/CategoryGridCompact";
import ProductCardCompact from "components/shop/ProductCardCompact";
import ContentState from "components/common/ContentState";
import DevelopmentNotice from "components/common/DevelopmentNotice";
import DebugInfo from "components/common/DebugInfo";
import PendingOrderWidget from "components/order/PendingOrderWidget";
import { useBackendStatus } from "context/BackendStatusContext";
import { usePendingOrder } from "hooks/usePendingOrder";

// Features will be defined inside the component to access translations

// Normalize product data to ensure consistent structure
const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product.productId,
  productId: product.productId || product.id,
  name: product.name || product.productName || "Unnamed Product",
  productName: product.productName || product.name || "Unnamed Product",
  image: product.image,
  unit: product.unit || product.unitName,
  unitName: product.unitName || product.unit,
  description: product.description || "",
  categoryName: product.categoryName || "Uncategorized",
});

// Simple favorites management using localStorage
const getFavorites = () => {
  try {
    const favorites = localStorage.getItem("userFavorites");
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
};

const getFavoriteProducts = async () => {
  const favoriteIds = getFavorites();
  if (favoriteIds.length === 0) return [];

  try {
    // Fetch products and filter by favorites
    const response = await productApi.list(null, 0, 50); // Get more products to find favorites
    const allProducts = response?.content || [];
    return allProducts
      .filter((product) =>
        favoriteIds.includes(product.id || product.productId)
      )
      .map(normalizeProduct);
  } catch (error) {
    console.error("Error fetching favorite products:", error);
    return [];
  }
};

// Custom hook to use our translation files
const usePageTranslation = () => {
  const { t: tCommon } = useTranslation("common");
  const { t: tHomepage } = useTranslation("homepage");
  const { t: tProducts } = useTranslation("products");
  const { t: tCategories } = useTranslation("categories");
  const { t: tNavigation } = useTranslation("navigation");

  return {
    tCommon,
    tHomepage,
    tProducts,
    tCategories,
    tNavigation,
  };
};

export default function HomePage() {
  const { t } = useTranslation();
  const { tCommon, tHomepage, tProducts, tCategories, tNavigation } =
    usePageTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const { isBackendAvailable } = useBackendStatus();
  const {
    pendingOrder,
    loading: pendingLoading,
    refresh: refreshPendingOrder,
    hasPendingOrder,
  } = usePendingOrder();

  // Define features with translations
  const features = [
    {
      icon: <InventoryIcon />,
      title: tHomepage("features.inventory.title"),
      description: tHomepage("features.inventory.description"),
      color: "#4caf50",
    },
    {
      icon: <AssessmentIcon />,
      title: tHomepage("features.analytics.title"),
      description: tHomepage("features.analytics.description"),
      color: "#2196f3",
    },
    {
      icon: <ScheduleIcon />,
      title: tHomepage("features.ordering.title"),
      description: tHomepage("features.ordering.description"),
      color: "#ff9800",
    },
  ];

  const {
    data: cats = [],
    isLoading: catLoad,
    error: catErr,
  } = useQuery({
    queryKey: ["cats"],
    queryFn: categoryApi.all,
    staleTime: 60_000,
  });

  const {
    data: pop = [],
    isLoading: popLoad,
    error: popErr,
  } = useQuery({
    queryKey: ["popular"],
    queryFn: async () => {
      const result = await productApi.top(8);
      console.log("Popular products data:", result);
      // The API now handles fallback internally, so we just need to normalize
      return Array.isArray(result) ? result.map(normalizeProduct) : [];
    },
    staleTime: 60_000,
    retry: 1, // Only retry once to avoid spam
  });

  const {
    data: favorites = [],
    isLoading: favLoad,
    error: favErr,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavoriteProducts,
    staleTime: 30_000,
    enabled: getFavorites().length > 0, // Only fetch if there are favorites
  });

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const query = searchQuery.trim();
      if (query) {
        navigate(`/products?page=0&q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <>
      <DevelopmentNotice />
      <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
        {/* Clean Action Header */}
        <Box sx={{ bgcolor: "#f8f9fa", py: { xs: 3, md: 4 } }}>
          <Container maxWidth="lg">
            <Paper
              elevation={8}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(102, 126, 234, 0.1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Box sx={{ position: "relative", zIndex: 1 }}>
                {/* Main Action Row */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "center" },
                    gap: { xs: 2, md: 3 },
                  }}
                >
                  {/* Search Section */}
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 300 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "white",
                        borderRadius: 3,
                        border: "2px solid #e3f2fd",
                        transition: "all 0.3s ease",
                        "&:focus-within": {
                          borderColor: "#667eea",
                          boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={tHomepage("search.placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#667eea" }} />
                            </InputAdornment>
                          ),
                          sx: {
                            border: "none",
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                            "& input": {
                              py: 1.5,
                              fontSize: "1rem",
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSearch}
                        sx={{
                          m: 0.5,
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {tCommon("actions.search")}
                      </Button>
                    </Box>
                  </Box>

                  {/* Quick Actions */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ minWidth: { xs: "100%", md: "auto" } }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => navigate("/products")}
                      startIcon={<CategoryIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        background:
                          "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)",
                        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                        fontWeight: 600,
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #388e3c 30%, #689f38 90%)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {tHomepage("actions.browseCatalog")}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/order-history")}
                      startIcon={<ScheduleIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        borderWidth: 2,
                        borderColor: "#667eea",
                        color: "#667eea",
                        fontWeight: 600,
                        "&:hover": {
                          borderWidth: 2,
                          bgcolor: "rgba(102, 126, 234, 0.08)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {tHomepage("actions.myRequests")}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Pending Order Widget */}
        {hasPendingOrder && (
          <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
              <PendingOrderWidget
                order={pendingOrder}
                onRefresh={refreshPendingOrder}
              />
            </Container>
          </Box>
        )}

        {/* Categories Section */}
        <Box sx={{ py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <SectionTitle
              subtitle={tHomepage("sections.categories.subtitle")}
              align="center"
            >
              <CategoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {tCategories("title")}
            </SectionTitle>

            <ContentState loading={catLoad} error={catErr}>
              <CategoryGridCompact categories={cats} />
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/products")}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  {tHomepage("actions.browseAllItems")}
                </Button>
              </Box>
            </ContentState>
          </Container>
        </Box>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <Box sx={{ bgcolor: "#f8f9fa", py: { xs: 6, md: 8 } }}>
            <Container maxWidth="lg">
              <SectionTitle
                subtitle={tHomepage("sections.favorites.subtitle")}
                align="center"
              >
                <FavoriteIcon
                  sx={{ mr: 1, verticalAlign: "middle", color: "#e91e63" }}
                />
                {tHomepage("sections.favorites.title")}
              </SectionTitle>

              <ContentState
                loading={favLoad}
                error={favErr}
                empty={
                  !favorites.length && tHomepage("sections.favorites.empty")
                }
              >
                {!!favorites.length && (
                  <Grid container spacing={2}>
                    {favorites.slice(0, 8).map((product, index) => (
                      <Grid
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        key={product.id || product.productId || index}
                      >
                        <ProductCardCompact data={product} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </ContentState>

              {favorites.length > 8 && (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/products?favorites=true")}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      borderWidth: 2,
                      borderColor: "#e91e63",
                      color: "#e91e63",
                      "&:hover": {
                        borderWidth: 2,
                        bgcolor: "rgba(233, 30, 99, 0.08)",
                      },
                    }}
                  >
                    {tHomepage("actions.viewAllFavorites")}
                  </Button>
                </Box>
              )}
            </Container>
          </Box>
        )}

        {/* Popular Products Section */}
        <Box sx={{ bgcolor: "white", py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <SectionTitle
              subtitle={tHomepage("sections.popular.subtitle")}
              align="center"
            >
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {tHomepage("sections.popular.title")}
            </SectionTitle>

            <ContentState
              loading={popLoad}
              error={popErr}
              empty={!pop.length && tHomepage("sections.popular.empty")}
            >
              {!!pop.length && (
                <Grid container spacing={2}>
                  {pop.map((product, index) => (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                      key={product.id || product.productId || index}
                    >
                      <ProductCardCompact data={product} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </ContentState>

            {pop.length > 0 && (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/products")}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background:
                      "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #388e3c 30%, #689f38 90%)",
                    },
                  }}
                >
                  {tHomepage("actions.viewFullCatalog")}
                </Button>
              </Box>
            )}
          </Container>
        </Box>

        {/* System Features */}
        <Box sx={{ bgcolor: "#f8f9fa", py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <SectionTitle
              subtitle={tHomepage("sections.features.subtitle")}
              align="center"
            >
              <AssessmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {tHomepage("sections.features.title")}
            </SectionTitle>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card
                    elevation={2}
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      borderRadius: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        width: 48,
                        height: 48,
                        mx: "auto",
                        mb: 1.5,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem" }}
                    >
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
      
    </>
  );
}
