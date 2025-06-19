import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useContext } from "react";
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
  Stack,
  Container,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TranslateIcon from "@mui/icons-material/Translate";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import Footer from "examples/Footer";
import CartDrawer from "pages/User/Cart/CartDrawer";
import OrderWindowIndicator from "components/indicators/OrderWindowIndicator";
import SearchBar from "components/common/SearchBar";
import { useCart } from "../../context/CartContext/useCart";
import { useNotifications } from "context/NotificationContext";
import { useTranslation } from "react-i18next";
import { AuthContext } from "context/AuthContext";

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
  const { pathname } = useLocation();
  const { cartCount, openCart } = useCart();
  const { t, i18n } = useTranslation();
  const { auth } = useContext(AuthContext);

  const [profEl, setProfEl] = useState(null);
  const [langEl, setLangEl] = useState(null);
  const { items } = useNotifications();
  const unreadCount = items.filter((n) => !n.read).length;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangEl(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 1, minHeight: { xs: 64, sm: 70 } }}>
          {/* Logo/Brand */}
          <Box
            component={Link}
            to="/dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: { xs: 2, md: 4 },
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 36, sm: 42 },
                height: { xs: 36, sm: 42 },
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: { xs: 1.5, sm: 2 },
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                },
              }}
            >
              <Typography variant="h6" fontWeight={700} color="white" sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                📋
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { sm: '1.1rem', md: '1.25rem' },
                  lineHeight: 1,
                }}
              >
                Stationery
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  lineHeight: 1,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                }}
              >
                Management
              </Typography>
            </Box>
          </Box>

          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: { xs: 300, sm: 400, md: 600 }, mx: { xs: 1, md: 3 } }}>
            <SearchBar
              placeholder={t('common.search') + " products, categories..."}
              size="small"
            />
          </Box>

          {/* Action Icons */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
            <OrderWindowIndicator />
            
            <IconButton
              onClick={() => navigate('/notifications')}
              sx={{
                bgcolor: 'rgba(102, 126, 234, 0.08)',
                border: '1px solid rgba(102, 126, 234, 0.12)',
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                    fontWeight: 600,
                  },
                }}
              >
                <NotificationsIcon fontSize="small" sx={{ color: '#667eea' }} />
              </Badge>
            </IconButton>

            <IconButton
              onClick={openCart}
              sx={{
                bgcolor: cartCount > 0 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(102, 126, 234, 0.08)',
                border: '1px solid',
                borderColor: cartCount > 0 ? 'rgba(76, 175, 80, 0.12)' : 'rgba(102, 126, 234, 0.12)',
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                '&:hover': {
                  bgcolor: cartCount > 0 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: cartCount > 0 
                    ? '0 4px 12px rgba(76, 175, 80, 0.2)' 
                    : '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <Badge 
                badgeContent={cartCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    minWidth: 18,
                    height: 18,
                    fontWeight: 600,
                    animation: cartCount > 0 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  },
                }}
              >
                <ShoppingCartIcon 
                  fontSize="small" 
                  sx={{ color: cartCount > 0 ? '#4caf50' : '#667eea' }} 
                />
              </Badge>
            </IconButton>

            <IconButton
              onClick={(e) => setLangEl(e.currentTarget)}
              sx={{
                bgcolor: 'rgba(102, 126, 234, 0.08)',
                border: '1px solid rgba(102, 126, 234, 0.12)',
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <TranslateIcon fontSize="small" sx={{ color: '#667eea' }} />
            </IconButton>

            <Box sx={{ ml: { xs: 1, sm: 1.5 } }}>
              <IconButton
                onClick={(e) => setProfEl(e.currentTarget)}
                sx={{
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Avatar 
                  sx={{ 
                    width: { xs: 36, sm: 40 }, 
                    height: { xs: 36, sm: 40 },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                    },
                  }}
                >
                  {auth?.user?.username?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ----- Menus ----- */}
      <Menu
        anchorEl={profEl}
        open={Boolean(profEl)}
        onClose={() => setProfEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 1,
            minWidth: 200,
          }
        }}
      >
        <MenuItem 
          onClick={() => navigate("/profile")}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.08)',
            },
          }}
        >
          <PersonIcon fontSize="small" sx={{ mr: 2, color: '#667eea' }} /> 
          <Typography variant="body2" fontWeight={500}>
            {t('user.profile')}
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.08)',
            },
          }}
        >
          <LogoutIcon fontSize="small" sx={{ mr: 2, color: 'error.main' }} /> 
          <Typography variant="body2" fontWeight={500} color="error.main">
            {t('user.logout')}
          </Typography>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={langEl}
        open={Boolean(langEl)}
        onClose={() => setLangEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 1,
            minWidth: 180,
          }
        }}
      >
        <MenuItem 
          onClick={() => changeLanguage('en')}
          sx={{ 
            py: 1.5,
            px: 2,
            fontWeight: i18n.language === 'en' ? 600 : 400,
            bgcolor: i18n.language === 'en' ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.12)',
            },
          }}
        >
          <Typography variant="body2">
            🇺🇸 English
          </Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('vi')}
          sx={{ 
            py: 1.5,
            px: 2,
            fontWeight: i18n.language === 'vi' ? 600 : 400,
            bgcolor: i18n.language === 'vi' ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.12)',
            },
          }}
        >
          <Typography variant="body2">
            🇻🇳 Tiếng Việt
          </Typography>
        </MenuItem>
      </Menu>

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* This gives the exact height of the AppBar on every breakpoint */}
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
        <Box sx={{ width: "100%", mb: 4, flex: 1 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Outlet />
          </Container>
        </Box>
        <Footer />
      </Box>

      <CartDrawer />
    </Box>
  );
}