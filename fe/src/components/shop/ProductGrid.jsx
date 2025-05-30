import { Grid, Alert, Skeleton, Box, Stack } from "@mui/material";
import ProductCard from "./ProductCard";
import ProductRow from "./ProductRow";
import "../../css/components/ProductGrid.css";

export default function ProductGrid({ products, loading, view = "grid", onAddToCart }) {
  if (loading)
    return (
      <Grid container spacing={3} className="product-grid">
        {Array.from({ length: view === "list" ? 4 : 9 }).map((_, i) => (
          <Grid
            key={i}
            item
            xs={12}
            sm={view === "list" ? 12 : 6}
            md={view === "list" ? 12 : 4}
          >
            <Skeleton
              variant="rectangular"
              height={view === "list" ? 120 : 300}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
    );

  if (!products.length) return <Alert severity="info">No products found.</Alert>;

  if (view === "list")
    return (
      <Stack spacing={2} className="product-grid">
        {products.map((p) => (
          <ProductRow key={p.id ?? p.productId} data={p} onAdd={(q) => onAddToCart(p, q)} />
        ))}
      </Stack>
    );

  return (
    <Box className="product-grid">
      <Grid container spacing={3}>
        {products.map((p) => (
          <Grid key={p.id ?? p.productId} item xs={12} sm={6} md={4}>
            <ProductCard data={p} onAdd={(q) => onAddToCart(p, q)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}