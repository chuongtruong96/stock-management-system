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
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import QuantitySelector from "components/QuantitySelector";
import { useCart } from "context/CartContext";
import { toast } from "react-toastify";

export default function CartDrawer() {
  const {
    drawerOpen,
    closeCart,
    items,
    remove,
    updateQty,
    totalItems,
  } = useCart();

  const handleCheckout = () => {
    if (!items.length) return toast.info("Cart is empty");
    window.location.href = "/order-form";
  };

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeCart}
      PaperProps={{
        sx: {
          width: { xs: 400, sm: 600 }, // Increased width for a wider drawer
          background: "rgba(20, 30, 60, 0.9)", // Semi-transparent dark background
          backdropFilter: "blur(10px)", // Blur effect for a futuristic look
          border: "1px solid rgba(0, 255, 255, 0.5)", // Cyan glowing border
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)", // Glowing effect
          color: "#ffffff", // White text for contrast
          overflowX: "hidden", // Remove horizontal scrollbar
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
              background: "linear-gradient(90deg, #00ffff, #ff00ff)", // Gradient text
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cart ({totalItems})
          </Typography>
          <IconButton
            size="small"
            onClick={closeCart}
            sx={{
              color: "#00ffff", // Cyan color for icon
              "&:hover": { color: "#ff00ff" }, // Magenta on hover
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider
          sx={{
            my: 2,
            background: "rgba(0, 255, 255, 0.3)", // Glowing cyan divider
          }}
        />

        {/* Cart Items */}
        <List dense sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          {items.map((it) => (
            <ListItem
              key={it.id}
              sx={{
                alignItems: "flex-start",
                background: "rgba(255, 255, 255, 0.05)", // Slight transparency
                borderRadius: 1,
                mb: 1,
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)", // Hover effect
                },
              }}
            >
              <Avatar
                src={it.imageUrl || "/placeholder-prod.png"}
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  border: "2px solid #00ffff", // Cyan border for avatar
                }}
              />
              <ListItemText
                primary={it.name}
                secondary={`${it.quantity} × ${it.unit}`}
                primaryTypographyProps={{ color: "#ffffff", fontWeight: 500 }}
                secondaryTypographyProps={{ color: "rgba(255, 255, 255, 0.7)" }}
                sx={{ mr: 2 }}
              />
              <QuantitySelector
                small
                min={1}
                value={it.quantity}
                setValue={(v) => updateQty(it.id, v)}
                sx={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 1,
                  "& button": {
                    color: "#00ffff",
                    "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
                  },
                }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() => remove(it.id)}
                  sx={{
                    color: "#ff00ff", // Magenta delete icon
                    "&:hover": { color: "#00ffff" }, // Cyan on hover
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {!items.length && (
            <Typography
              align="center"
              sx={{
                my: 4,
                color: "rgba(255, 255, 255, 0.7)",
                fontStyle: "italic",
              }}
            >
              No items
            </Typography>
          )}
        </List>

        <Divider
          sx={{
            my: 2,
            background: "rgba(0, 255, 255, 0.3)", // Glowing cyan divider
          }}
        />

        {/* Proceed Button */}
        <Button
          fullWidth
          variant="contained"
          disabled={!items.length}
          onClick={handleCheckout}
          sx={{
            background: "linear-gradient(90deg, #00ffff, #ff00ff)", // Gradient button
            color: "#ffffff",
            fontWeight: 600,
            boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)", // Glowing shadow
            "&:hover": {
              background: "linear-gradient(90deg, #ff00ff, #00ffff)", // Reverse gradient on hover
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.7)",
            },
            "&:disabled": {
              background: "rgba(227, 200, 200, 0.1)",
              color: "rgba(255, 255, 255, 0.3)",
              boxShadow: "none",
            },
          }}
        >
          Proceed
        </Button>
      </Box>
    </Drawer>
  );
}