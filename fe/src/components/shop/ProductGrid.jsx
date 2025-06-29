import { 
  Box, 
  Skeleton, 
  Alert, 
  Stack, 
  Typography,
  Paper,
  Container,
  Grid,
} from "@mui/material";
import {
  SearchOff as NoResultsIcon,
  Inventory as ProductsIcon,
} from "@mui/icons-material";
import { useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductRow  from "./ProductRow";
import LoadingSpinner from "../common/LoadingSpinner";

export default function ProductGrid({
  products = [],
  loading  = false,
  view     = "grid",
  onAddToCart,
}) {
  const valid = useMemo(() => products.filter(Boolean), [products]);

  /* ─── loading ─── */
  if (loading) {
    if (view === "list") {
      return (
        <Stack spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="rectangular" width={120} height={80} sx={{ borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="30%" height={20} sx={{ mt: 1 }} />
                </Box>
                <Box>
                  <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      );
    }

    return (
      <Grid container spacing={2}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid 
            item 
            xs={12}   // 1 product per row on mobile
            sm={6}    // 2 products per row on small screens
            md={4}    // 3 products per row on medium screens
            lg={3}    // 4 products per row on large screens
            xl={3}    // 4 products per row on extra large screens
            key={i}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Skeleton variant="rectangular" height={180} />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={32} sx={{ mt: 2, borderRadius: 1 }} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  /* ─── empty ─── */
  if (!valid.length) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <NoResultsIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Box>
        <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
          No products found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
        </Typography>
      </Paper>
    );
  }

  /* ─── list view ─── */
  if (view === "list") {
    return (
      <Stack spacing={2}>
        {valid.map((p, index) => (
          <ProductRow
            key={p.id || p.productId || index}
            data={p}
            onAdd={(prod, q) => onAddToCart?.(prod, q)}
          />
        ))}
      </Stack>
    );
  }

  /* ─── grid view ─── */
  return (
    <Grid container spacing={2}>
      {valid.map((p, index) => (
        <Grid 
          item 
          xs={12}   // 1 product per row on mobile
          sm={6}    // 2 products per row on small screens
          md={4}    // 3 products per row on medium screens
          lg={3}    // 4 products per row on large screens
          xl={3}    // 4 products per row on extra large screens
          key={p.id || p.productId || index}
        >
          <ProductCard
            data={p}
            onAdd={(prod, q) => onAddToCart?.(prod, q)}
          />
        </Grid>
      ))}
    </Grid>
  );
}