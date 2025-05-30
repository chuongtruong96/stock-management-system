import { Box, Container, Paper, Stack, TextField, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { categoryApi, productApi } from "services/api";
import Typography from "@mui/material/Typography";
import SectionTitle from "components/common/SectionTitle";
import CategoryGridCompact from "components/categories/CategoryGridCompact";
import ProductCard from "components/shop/ProductCard";
import ContentState from "components/common/ContentState";
import "../../../css/pages/HomePage.css";
import "../../../css/components/CategoryGridCompact.css";
import "../../../css/components/CategoryCard.css";

export default function HomePage() {
  const { data: cats = [], isLoading: catLoad, error: catErr } = useQuery({
    queryKey: ["cats"],
    queryFn: categoryApi.all,
    staleTime: 60_000,
  });

  const { data: pop = [], isLoading: popLoad, error: popErr } = useQuery({
    queryKey: ["popular"],
    queryFn: () => productApi.top(12).then((a) => a.map(productApi.normalize)),
    staleTime: 60_000,
    onError: (err) => console.error("Error fetching popular products:", err),
  });

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value.trim();
      if (query) window.location.href = `/products?page=0&q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <Box sx={{ bgcolor: "grey.50", pb: 8 }}>
      {/* Search Bar */}
      <Box className="search-bar" sx={{ bgcolor: "common.white", py: 3 }}>
        <Container maxWidth="lg" className="container">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products or categories..."
            onKeyDown={handleSearch}
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Container>
      </Box>

      {/* Categories Section */}
      <Box className="category-section" sx={{ bgcolor: "common.white", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" className="container">
          <SectionTitle subtitle="Browse" className="section-title">
            Categories
          </SectionTitle>
          <ContentState loading={catLoad} error={catErr}>
            <CategoryGridCompact categories={cats} className="category-grid" />
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button variant="outlined" href="/categories" className="view-all-button" sx={{ borderRadius: 2 }}>
                View All
              </Button>
            </Box>
          </ContentState>
        </Container>
      </Box>

      {/* Popular Products Section */}
      <Box className="popular-section" sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" className="container">
          <SectionTitle subtitle="Top ordered" className="section-title">
            Popular Products
          </SectionTitle>
          <ContentState loading={popLoad} error={popErr} empty={!pop.length && "No popular products yet"}>
            {!!pop.length && (
              <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: "grey.300", borderRadius: 2 }}>
                <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1, "& > *": { flex: "0 0 240px" } }}>
                  {pop.map((p) => <ProductCard key={p.productId} data={p} showActions={false} className="product-card" />)}
                </Stack>
              </Paper>
            )}
          </ContentState>
          {popErr && <Typography color="error">Error: {popErr.message}</Typography>}
        </Container>
      </Box>
    </Box>
  );
}