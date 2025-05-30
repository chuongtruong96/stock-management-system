import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  CssBaseline,
  styled,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TranslateIcon from "@mui/icons-material/Translate";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import CartDrawer from "pages/User/Cart/CartDrawer"; // Ensure this is the correct import
import OrderWindowIndicator from "components/OrderWindowIndicator";
import { useCart } from "context/CartContext";
import { useState } from "react";

const SearchBox = styled("div")(({ theme }) => ({
  position: "relative",
  flexGrow: 1,
  maxWidth: 400,
  "& input": {
    width: "100%",
    padding: "8px 12px 8px 36px",
    borderRadius: 8,
    border: "1px solid #d0d5dd",
    background: "#fafafa",
    outline: "none",
  },
  "& svg": {
    position: "absolute",
    top: "50%",
    left: 12,
    transform: "translateY(-50%)",
    color: "#9e9e9e",
  },
}));

export default function UserLayout() {
  const navigate = useNavigate();
  const { cartCount, openCart } = useCart(); // Use openCart from context
  const [profEl, setProfEl] = useState(null);
  const [langEl, setLangEl] = useState(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* ------------ APP BAR ------------ */}
      <AppBar position="fixed" color="inherit" elevation={1}>
        <Toolbar sx={{ px: { xs: 1, md: 2 } }}>
          <Typography
            component={Link}
            to="/dashboard"
            variant="h6"
            sx={{ textDecoration: "none", color: "text.primary", mr: 2, whiteSpace: "nowrap" }}
          >
            Stationery Mgnt
          </Typography>

          <SearchBox>
            <SearchIcon fontSize="small" />
            <input
              placeholder="Search products / categories…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const kw = e.target.value.trim();
                  if (kw) navigate(`/products?page=0&q=${encodeURIComponent(kw)}`);
                }
              }}
            />
          </SearchBox>

          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <OrderWindowIndicator />

            <IconButton>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={openCart}> {/* Use openCart from useCart */}
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={(e) => setLangEl(e.currentTarget)}>
              <TranslateIcon />
            </IconButton>

            <IconButton sx={{ p: 0, ml: 1 }} onClick={(e) => setProfEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ----- Menus ----- */}
      <Menu anchorEl={profEl} open={Boolean(profEl)} onClose={() => setProfEl(null)}>
        <MenuItem onClick={() => { setProfEl(null); navigate("/profile"); }}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
        </MenuItem>
      </Menu>

      <Menu anchorEl={langEl} open={Boolean(langEl)} onClose={() => setLangEl(null)}>
        <MenuItem onClick={() => setLangEl(null)}>English</MenuItem>
        <MenuItem onClick={() => setLangEl(null)}>Tiếng Việt</MenuItem>
      </Menu>

      {/* ------------ MAIN ------------ */}
      <Box component="main" sx={{ flexGrow: 1, mt: 8, p: 2, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 1280 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Render CartDrawer without props */}
      <CartDrawer />
    </Box>
  );
}