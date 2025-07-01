// react-router components
import { useLocation, Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import { AuthContext } from "context/AuthContext";
import { useTranslation } from "react-i18next";
// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import { 
  Box, 
  Typography, 
  Avatar, 
  Chip, 
  Badge,
  Tooltip,
  alpha,
  useTheme,
  InputBase,
  Paper
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";

// Material Dashboard 2 React components
import MDBox from "components/template/MDBox";
import MDInput from "components/template/MDInput";

// Material Dashboard 2 React example components
import NavbarBreadcrumbs from "examples/Breadcrumbs/NavbarBreadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import NotificationBell from "components/layout/NotificationBell";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    darkMode,
  } = controller;
  
  const [accountAnchor, setAccountAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const { logout, auth } = useContext(AuthContext);
  const { i18n } = useTranslation();
  const theme = useTheme();
  const location = useLocation();

  const openAccountMenu = (e) => setAccountAnchor(e.currentTarget);
  const closeAccountMenu = () => setAccountAnchor(null);
  const route = location.pathname.split("/").slice(1);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchValue.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchValue);
      // navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Get page title from route
  const getPageTitle = () => {
    const routeMap = {
      'admin': 'Admin Dashboard',
      'order-management': 'Order Management',
      'product-management': 'Product Management',
      'category-management': 'Category Management',
      'user-management': 'User Management',
      'unit-management': 'Unit Management',
      'reports': 'Reports & Analytics',
      'notifications': 'Notifications',
      'profile': 'Profile',
    };
    
    const currentRoute = route[route.length - 1];
    return routeMap[currentRoute] || currentRoute?.replace(/-/g, ' ') || 'Dashboard';
  };

  // Styles for the navbar icons
  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const renderAccount = () => (
    <Menu
      anchorEl={accountAnchor}
      open={Boolean(accountAnchor)}
      onClose={closeAccountMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          mt: 1,
          borderRadius: 2,
          minWidth: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid',
          borderColor: 'divider',
        }
      }}
    >
      {/* User Info Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.8rem'
            }}
          >
            {auth?.user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {auth?.user?.username || 'User'}
            </Typography>
            <Chip
              label={auth?.user?.roles?.[0] || 'User'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <MenuItem 
        component={Link} 
        to="/profile" 
        onClick={closeAccountMenu}
        sx={{ py: 1.5, gap: 1.5 }}
      >
        <PersonIcon fontSize="small" />
        <Typography variant="body2">Profile</Typography>
      </MenuItem>

      <MenuItem 
        onClick={handleConfiguratorOpen}
        sx={{ py: 1.5, gap: 1.5 }}
      >
        <SettingsIcon fontSize="small" />
        <Typography variant="body2">Settings</Typography>
      </MenuItem>

      <MenuItem
        onClick={() => {
          logout();
          closeAccountMenu();
          navigate("/auth/sign-in");
        }}
        sx={{ 
          py: 1.5, 
          gap: 1.5,
          color: 'error.main',
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 0.5
        }}
      >
        <LogoutIcon fontSize="small" />
        <Typography variant="body2">Logout</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => ({
        ...navbar(theme, { transparentNavbar, absolute, light, darkMode }),
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        boxShadow: transparentNavbar ? 'none' : '0 2px 20px rgba(0,0,0,0.08)',
      })}
    >
      <Toolbar sx={(theme) => ({ ...navbarContainer(theme), minHeight: '56px !important', height: '56px' })}>
        {/* Left Section - Clean Breadcrumbs */}
        <MDBox
          color="inherit"
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            {/* Mobile Menu Button */}
            <IconButton
              size="small"
              disableRipple
              color="inherit"
              sx={{
                ...navbarMobileMenu,
                display: { xs: 'flex', xl: 'none' },
                flexShrink: 0
              }}
              onClick={handleMiniSidenav}
            >
              <MenuIcon sx={iconsStyle} fontSize="medium" />
            </IconButton>

            {/* Clean Navbar Breadcrumbs */}
            <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              {/* Desktop: Show clean breadcrumbs */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <NavbarBreadcrumbs
                  icon="home"
                  title={getPageTitle()}
                  route={route}
                  light={light}
                />
              </Box>
              {/* Mobile: Show only page title */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Typography 
                  variant="h6" 
                  fontWeight={600}
                  sx={{ 
                    fontSize: '0.95rem',
                    color: light ? 'white' : 'text.primary',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getPageTitle()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </MDBox>

        {/* Right Section - Search and Actions */}
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            {/* Enhanced Search - Hidden on mobile */}
            <Paper
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                width: { sm: 200, md: 300 },
                height: 40,
                mr: 2,
                px: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                },
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleSearch}
                sx={{
                  flex: 1,
                  fontSize: '0.9rem',
                  '& input::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.7
                  }
                }}
              />
            </Paper>

            {/* Action Icons */}
            <MDBox color={light ? "white" : "inherit"} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Language Toggle */}
              <Tooltip title={`Switch to ${i18n.language === 'en' ? 'Vietnamese' : 'English'}`}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={{
                    ...navbarIconButton,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.2),
                      transform: 'scale(1.05)',
                    }
                  }}
                  onClick={toggleLanguage}
                >
                  <LanguageIcon sx={iconsStyle} />
                  <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {i18n.language.toUpperCase()}
                  </Typography>
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <NotificationBell />

              {/* Settings */}
              <Tooltip title="Settings">
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={{
                    ...navbarIconButton,
                    bgcolor: alpha(theme.palette.action.hover, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.2),
                      transform: 'scale(1.05)',
                    }
                  }}
                  onClick={handleConfiguratorOpen}
                >
                  <SettingsIcon sx={iconsStyle} />
                </IconButton>
              </Tooltip>

              {/* User Account */}
              <Tooltip title="Account">
                <IconButton
                  sx={{
                    ...navbarIconButton,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)',
                    }
                  }}
                  size="small"
                  disableRipple
                  onClick={openAccountMenu}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: 'primary.main',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {auth?.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              {renderAccount()}

              {/* Desktop Sidebar Toggle */}
              <Tooltip title={miniSidenav ? "Expand sidebar" : "Collapse sidebar"}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={{
                    ...navbarMobileMenu,
                    display: { xs: 'none', xl: 'flex' },
                    bgcolor: alpha(theme.palette.action.hover, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.2),
                      transform: 'scale(1.05)',
                    }
                  }}
                  onClick={handleMiniSidenav}
                >
                  <Icon sx={iconsStyle} fontSize="medium">
                    {miniSidenav ? "menu_open" : "menu"}
                  </Icon>
                </IconButton>
              </Tooltip>
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;