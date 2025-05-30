import { Paper, Box, Typography, Button, Stack } from "@mui/material";
import QuantitySelector from "./QuantitySelector";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProductRow({ data, onAdd }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const id = data.id ?? data.productId;
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, cursor: "pointer", borderRadius: 2, "&:hover": { boxShadow: 2 } }}
    >
      <Box
        component="img"
        src={data.image ? `/uploads/product-img/${data.image}` : "/placeholder-prod.png"}
        alt={data.name}
        sx={{ width: 96, height: 96, objectFit: "cover", cursor: "pointer", flexShrink: 0,borderRadius: 2 }}
        onClick={() => navigate(`/products/${id}`)}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {data.name}
        </Typography>
        {data.price && (
          <Typography variant="subtitle2" color="primary">
            {data.price.toLocaleString()} ₫
          </Typography>
        )}
      </Box>
      {onAdd && (
        <Stack direction="row" spacing={1} alignItems="center">
          <QuantitySelector value={qty} setValue={setQty} size="small" />
          <Button
            variant="contained"
            size="small"
            startIcon={<ShoppingCartIcon fontSize="small" />}
            onClick={() => onAdd(qty)}
          >
            Add
          </Button>
        </Stack>
      )}
    </Paper>
  );
}