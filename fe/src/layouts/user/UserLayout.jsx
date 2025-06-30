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

  const handleLanguageChange = async (lng) => {
    setLangEl(null);
    if (lng !== i18n.language) {
      i18n.changeLanguage(lng);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(102, 126, 234, 0.08)',
          color: 'text.primary',
          boxShadow: '0 4px 32px rgba(102, 126, 234, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 1, minHeight: { xs: 64, sm: 70 }, display: 'flex', alignItems: 'center' }}>
          {/* Logo/Brand - Fixed Left */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexShrink: 0,
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

          {/* Spacer to push everything to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Search Bar - Center/Right Area */}
          <Box sx={{ 
            display: { xs: 'none', md: 'block' },
            maxWidth: 400,
            width: '100%',
            mr: 3,
            position: 'relative',
            zIndex: 2,
          }}>
            <Box sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                borderRadius: 3,
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: -1,
              },
              '&:focus-within::before': {
                opacity: 1,
              },
            }}>
              <SearchBar
                placeholder={t('search.searchPlaceholder') + " products, categories..."}
                size="small"
              />
            </Box>
          </Box>

          {/* Action Icons - Fixed Right */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" sx={{ flexShrink: 0 }}>
            {/* Mobile Search Icon */}
            <IconButton
              onClick={() => navigate('/products')}
              sx={{
                display: { xs: 'flex', md: 'none' },
                bgcolor: 'rgba(102, 126, 234, 0.08)',
                border: '1px solid rgba(102, 126, 234, 0.12)',
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: '#667eea' }} />
            </IconButton>

            <OrderWindowIndicator />
            
            <IconButton
              onClick={() => navigate('/notifications')}
              sx={{
                bgcolor: 'rgba(102, 126, 234, 0.08)',
                border: '1px solid rgba(102, 126, 234, 0.12)',
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.25)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover::before': {
                  opacity: 1,
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                    animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  },
                }}
              >
                <NotificationsIcon fontSize="small" sx={{ color: '#667eea', position: 'relative', zIndex: 1 }} />
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
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: cartCount > 0 
                    ? 'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))'
                    : 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  bgcolor: cartCount > 0 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: cartCount > 0 
                    ? '0 8px 20px rgba(76, 175, 80, 0.25)' 
                    : '0 8px 20px rgba(102, 126, 234, 0.25)',
                  borderColor: cartCount > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover::before': {
                  opacity: 1,
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.15)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.25)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover::before': {
                  opacity: 1,
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <TranslateIcon fontSize="small" sx={{ color: '#667eea', position: 'relative', zIndex: 1 }} />
            </IconButton>

            <Box sx={{ ml: { xs: 1, sm: 1.5 } }}>
              <IconButton
                onClick={(e) => setProfEl(e.currentTarget)}
                sx={{
                  p: 0,
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.08) translateY(-2px)',
                  },
                  '&:hover .avatar-glow': {
                    opacity: 1,
                    transform: 'scale(1.2)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box
                  className="avatar-glow"
                  sx={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
                    borderRadius: '50%',
                    opacity: 0,
                    transition: 'all 0.4s ease',
                    filter: 'blur(8px)',
                    zIndex: -1,
                  }}
                />
                <Avatar 
                  sx={{ 
                    width: { xs: 36, sm: 40 }, 
                    height: { xs: 36, sm: 40 },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 700,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    border: '3px solid rgba(255, 255, 255, 0.95)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                      transition: 'opacity 0.3s ease',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      left: -50,
                      width: 100,
                      height: 100,
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                      transform: 'rotate(45deg)',
                      transition: 'transform 0.6s ease',
                    },
                    '&:hover::after': {
                      transform: 'rotate(45deg) translate(100px, 100px)',
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
            Profile
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
            Logout
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
          onClick={() => handleLanguageChange('en')}
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
          onClick={() => handleLanguageChange('vi')}
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
          {pathname === '/products' ? (
            // Full width for products page
            <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
              <Outlet />
            </Box>
          ) : (
            // Constrained width for other pages
            <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
              <Outlet />
            </Container>
          )}
        </Box>
        <Footer />
      </Box>

      <CartDrawer />
    </Box>
  );
}