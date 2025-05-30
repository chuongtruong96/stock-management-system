import { CardContent, CardMedia, CardActions, Typography, Stack, Button } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CardBase from "../common/CardBase";
import QuantitySelector from "./QuantitySelector";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ data, onAdd, showActions = true }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const id = data.id ?? data.productId;

  return (
    <CardBase sx={{ height: 330, borderRadius: 2 }}>
      <CardMedia
        component="img"
        image={data.image ? `/uploads/product-img/${data.image}` : "/placeholder-prod.png"}
        alt={data.name}
        height={160}
        sx={{ objectFit: "cover", cursor: "pointer", borderRadius: "8px 8px 0 0" }}
        onClick={() => navigate(`/products/${id}`)}
        loading="lazy"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            color: "#212121",
          }}
        >
          {data.name}
        </Typography>
        {data.price && (
          <Typography variant="subtitle1" color="primary" mt={0.5}>
            {data.price.toLocaleString()} ₫
          </Typography>
        )}
      </CardContent>

      {showActions && (
        <CardActions sx={{ pt: 0, pb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" width="100%" px={2}>
            <QuantitySelector value={qty} setValue={setQty} />
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<ShoppingCartIcon fontSize="small" />}
              onClick={() => onAdd && onAdd(qty)}
            >
              ADD
            </Button>
          </Stack>
        </CardActions>
      )}
    </CardBase>
  );
}