import { Paper, Box, Typography, Button, Stack, Chip } from "@mui/material";
import QuantitySelector from "./QuantitySelector";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "context/CartContext/useCart";
import { useTranslation } from "react-i18next";
import { getProductImageUrl } from "utils/apiUtils";

export default function ProductRow({ data, onAdd }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const { isInCart, getCartItemQty } = useCart();
  const { t, i18n } = useTranslation();

  const id = data.id ?? data.productId;
  const inCart = isInCart(id);
  const cartQty = getCartItemQty(id);
  
  // Get display name based on current language
  const getDisplayName = () => {
    if (i18n.language === 'vi') {
      return data.nameVn || data.nameEn || data.name || 'Unnamed Product';
    } else {
      return data.nameEn || data.nameVn || data.name || 'Unnamed Product';
    }
  };
  
  const displayName = getDisplayName();

  return (
    <Paper
      variant="outlined"
      sx={{ 
        p: 2, 
        display: "flex", 
        alignItems: "center", 
        gap: 2, 
        cursor: "pointer", 
        borderRadius: 2, 
        "&:hover": { boxShadow: 2 },
        opacity: inCart ? 0.8 : 1,
        border: inCart ? "2px solid #4caf50" : "1px solid #e0e0e0",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={data.image ? getProductImageUrl(data.image) : "/placeholder-prod.png"}
          alt={data.name}
          sx={{ 
            width: 96, 
            height: 96, 
            objectFit: "cover", 
            cursor: "pointer", 
            flexShrink: 0,
            borderRadius: 2,
            filter: inCart ? "brightness(0.9)" : "brightness(1)",
          }}
          onClick={() => navigate(`/products/${id}`)}
        />
        {inCart && (
          <Chip
            icon={<CheckCircleIcon />}
            label={cartQty}
            color="success"
            size="small"
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography 
          variant="subtitle1" 
          fontWeight={600} 
          noWrap
          sx={{ color: inCart ? "#666" : "inherit" }}
        >
          {displayName}
        </Typography>
        {data.price && (
          <Typography variant="subtitle2" color="primary">
            {data.price.toLocaleString()} ₫
          </Typography>
        )}
      </Box>

      {onAdd && (
        <Stack direction="row" spacing={1} alignItems="center">
          {!inCart ? (
            <>
              <QuantitySelector value={qty} setValue={setQty} size="small" />
              <Button
                variant="contained"
                size="small"
                startIcon={<ShoppingCartIcon fontSize="small" />}
                onClick={() => onAdd(data, qty)}
                sx={{
                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #1976D2 30%, #1BA3D3 90%)",
                  }
                }}
              >
                {t('product.addToCart')}
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon fontSize="small" />}
              onClick={() => navigate("/order-form")}
              sx={{
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  background: "rgba(76, 175, 80, 0.1)",
                }
              }}
            >
              {t('product.inCart')} ({cartQty})
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
}