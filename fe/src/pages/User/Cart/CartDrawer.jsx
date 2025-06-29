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
import { getProductImageUrl } from "utils/apiUtils";

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
    console.log('🔍 CART: handleCheckout called');
    console.log('🔍 CART: Items count:', items.length);
    console.log('🔍 CART: Current auth state:', localStorage.getItem('user') ? 'Authenticated' : 'Not authenticated');
    
    if (!items.length) {
      console.log('🔍 CART: No items in cart, showing toast');
      toast.info(t('cart.emptyCart'));
      return;
    }
    
    try {
      console.log('🔍 CART: Closing cart drawer...');
      closeCart();
      
      // Use setTimeout to ensure cart closes before navigation
      setTimeout(() => {
        console.log('🔍 CART: Navigating to /order-form...');
        console.log('🔍 CART: Auth state before navigation:', localStorage.getItem('user') ? 'Still authenticated' : 'Lost authentication');
        navigate("/order-form", { replace: false });
      }, 100);
    } catch (error) {
      console.error("🔍 CART: Navigation error:", error);
      toast.error("Failed to navigate to order form");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeCart}
      PaperProps={{
        sx: {
          width: { xs: 400, sm: 600 },
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
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
              fontWeight: 700,
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            🛒 {t('cart.cart')} ({totalItems})
          </Typography>
          <IconButton
            size="small"
            onClick={closeCart}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { 
                bgcolor: "rgba(255,255,255,0.2)",
                transform: "scale(1.1)"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2, background: "rgba(255, 255, 255, 0.3)" }} />

        {/* Cart Items */}
        <List dense sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          {items.map((item) => {
            const product = item.product;
            const unitLabel =
              typeof product.unit === "object" && product.unit !== null
                ? product.unit.name || product.unit.nameVn
                : product.unit;
            const imageSrc = product?.image
              ? getProductImageUrl(product.image)
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
                    border: "2px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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
                      color: "rgba(255,255,255,0.7)",
                      bgcolor: "rgba(255,255,255,0.1)",
                      "&:hover": { 
                        color: "#ff4444",
                        bgcolor: "rgba(255,68,68,0.1)",
                        transform: "scale(1.1)"
                      },
                      transition: "all 0.2s ease-in-out"
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

        <Divider sx={{ my: 2, background: "rgba(255, 255, 255, 0.3)" }} />

        {/* Proceed Button */}
        <Button
          fullWidth
          variant="contained"
          disabled={!items.length}
          onClick={handleCheckout}
          sx={{
            py: 2,
            fontSize: "1.1rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white !important",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
            border: "2px solid rgba(255,255,255,0.2)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
              boxShadow: "0 12px 40px rgba(102, 126, 234, 0.6)",
              transform: "translateY(-2px)",
              color: "white !important",
            },
            "&:disabled": {
              background: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.3)",
              boxShadow: "none",
              transform: "none",
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          🚀 {t('cart.proceedToOrder')}
        </Button>
      </Box>
    </Drawer>
  );
}
