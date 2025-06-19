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
} from "@mui/material";
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  LocalOffer as OfferIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
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

const features = [
  {
    icon: <SpeedIcon />,
    title: "Fast Delivery",
    description: "Quick processing and delivery of your orders",
    color: "#4caf50",
  },
  {
    icon: <SecurityIcon />,
    title: "Secure Ordering",
    description: "Safe and secure ordering process",
    color: "#2196f3",
  },
  {
    icon: <SupportIcon />,
    title: "24/7 Support",
    description: "Round-the-clock customer support",
    color: "#ff9800",
  },
];

// Normalize product data to ensure consistent structure
const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product.productId,
  productId: product.productId || product.id,
  name: product.name || product.productName || 'Unnamed Product',
  productName: product.productName || product.name || 'Unnamed Product',
  image: product.image,
  unit: product.unit || product.unitName,
  unitName: product.unitName || product.unit,
  description: product.description || '',
  categoryName: product.categoryName || 'Uncategorized',
});

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cats = [], isLoading: catLoad, error: catErr } = useQuery({
    queryKey: ["cats"],
    queryFn: categoryApi.all,
    staleTime: 60_000,
  });

  const { data: pop = [], isLoading: popLoad, error: popErr } = useQuery({
    queryKey: ["popular"],
    queryFn: async () => {
      try {
        const result = await productApi.top(8);
        console.log("Popular products data:", result);
        // Normalize the data to ensure consistent structure
        return Array.isArray(result) ? result.map(normalizeProduct) : [];
      } catch (error) {
        console.error("Error fetching popular products:", error);
        return [];
      }
    },
    staleTime: 60_000,
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
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                mb: 2,
              }}
            >
              📋 Stationery Management
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                maxWidth: 600,
                mx: "auto",
                mb: 4,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Streamline your office supplies with our comprehensive stationery management system
            </Typography>

            {/* Enhanced Search Bar */}
            <Paper
              elevation={8}
              sx={{
                p: 1,
                borderRadius: 4,
                maxWidth: 600,
                mx: "auto",
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder={t('common.search') + " products or categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    border: "none",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  ml: 1,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)",
                  },
                }}
              >
                Search
              </Button>
            </Paper>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={4}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    transition: "transform 0.3s ease-in-out",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: feature.color,
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Browse" align="center">
            <CategoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            {t('category.categories')}
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
                View All Products
              </Button>
            </Box>
          </ContentState>
        </Container>
      </Box>

      {/* Popular Products Section */}
      <Box sx={{ bgcolor: "white", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <SectionTitle subtitle="Top ordered" align="center">
            <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Popular Products
          </SectionTitle>
          
          <ContentState 
            loading={popLoad} 
            error={popErr} 
            empty={!pop.length && "No popular products yet"}
          >
            {!!pop.length && (
              <Grid container spacing={2}>
                {pop.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id || product.productId || index}>
                    <ProductCardCompact
                      data={product}
                    />
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
                  background: "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #388e3c 30%, #689f38 90%)",
                  },
                }}
              >
                Explore All Products
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Browse our extensive catalog and place your first order today
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/products")}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Browse Products
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/order-history")}
              sx={{
                borderColor: "white",
                color: "white",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              View Orders
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}