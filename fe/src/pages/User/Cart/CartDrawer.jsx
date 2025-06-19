// src/pages/User/Cart/CartDrawer.jsx
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import QuantitySelector from "components/shop/QuantitySelector";
import { useCart } from "context/CartContext/useCart";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function CartDrawer() {
  const {
    drawerOpen,
    closeCart,
    items = [],
    removeItem,
    updateQty,
    totalItems,
  } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCheckout = () => {
    if (!items.length) return toast.info(t('cart.emptyCart'));
    closeCart();
    navigate("/order-form");
  };

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeCart}
      PaperProps={{
        sx: {
          width: { xs: 400, sm: 600 },
          background: "rgba(20, 30, 60, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 255, 255, 0.5)",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
          color: "#ffffff",
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(90deg, #00ffff, #ff00ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t('cart.cart')} ({totalItems})
          </Typography>
          <IconButton
            size="small"
            onClick={closeCart}
            sx={{
              color: "#00ffff",
              "&:hover": { color: "#ff00ff" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2, background: "rgba(0, 255, 255, 0.3)" }} />

        {/* Cart Items */}
        <List dense sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          {items.map((item) => {
            const product = item.product;
            const unitLabel =
              typeof product.unit === "object" && product.unit !== null
                ? product.unit.name || product.unit.nameVn
                : product.unit;
            const imageSrc = product?.image
              ? `/uploads/product-img/${product.image}`
              : "/placeholder-prod.png";

            return (
              <ListItem
                key={product.id}
                sx={{
                  alignItems: "flex-start",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 1,
                  mb: 1,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Avatar
                  src={imageSrc}
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    border: "2px solid #00ffff",
                  }}
                />
                <ListItemText
                primary={product.name}
                secondary={`${t('product.quantity')}: ${item.qty} × ${unitLabel}`}
                primaryTypographyProps={{
                color: "#ffffff",
                fontWeight: 500,
                }}
                secondaryTypographyProps={{
                color: "rgba(255, 255, 255, 0.7)",
                }}
                sx={{ mr: 2 }}
                />
                <QuantitySelector
                  value={item.qty}
                  setValue={(v) => updateQty(product.id, v)}
                  small
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => removeItem(product.id)}
                    sx={{
                      color: "#ff00ff",
                      "&:hover": { color: "#00ffff" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
          {!items.length && (
            <Typography
              align="center"
              sx={{
                my: 4,
                color: "rgba(255, 255, 255, 0.7)",
                fontStyle: "italic",
              }}
            >
              {t('cart.emptyCart')}
            </Typography>
          )}
        </List>

        <Divider sx={{ my: 2, background: "rgba(0, 255, 255, 0.3)" }} />

        {/* Proceed Button */}
        <Button
          fullWidth
          variant="contained"
          disabled={!items.length}
          onClick={handleCheckout}
          sx={{
            background: "linear-gradient(90deg, #00ffff, #ff00ff)",
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
            "&:hover": {
              background: "linear-gradient(90deg, #ff00ff, #00ffff)",
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.7)",
            },
            "&:disabled": {
              background: "rgba(227, 200, 200, 0.1)",
              color: "rgba(255, 255, 255, 0.3)",
              boxShadow: "none",
            },
          }}
        >
          {t('cart.proceedToOrder')}
        </Button>
      </Box>
    </Drawer>
  );
}
