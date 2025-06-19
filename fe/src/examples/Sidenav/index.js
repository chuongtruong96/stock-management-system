import { useContext, useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";
import { AuthContext } from "context/AuthContext";
// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import { Box, Typography, Avatar, Chip, Tooltip, IconButton } from "@mui/material";
import { 
  Settings as SettingsIcon, 
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

// Material Dashboard 2 React components
import MDBox from "components/template/MDBox";
import MDTypography from "components/template/MDTypography";
import MDButton from "components/template/MDButton";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    sidenavColor,
  } = controller;
  const location = useLocation();
  const { hasRole, auth, logout } = useContext(AuthContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const collapseName = location.pathname.replace("/", "");

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);
  const toggleSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  useEffect(() => {
    const handleMini = () => {
      const narrow = window.innerWidth < 1200;

      // Only auto-minimize on mobile, don't auto-expand
      if (narrow && !miniSidenav) {
        setMiniSidenav(dispatch, true);
      }
      
      if ((narrow ? false : transparentSidenav) !== transparentSidenav)
        setTransparentSidenav(dispatch, narrow ? false : transparentSidenav);
      if ((narrow ? false : whiteSidenav) !== whiteSidenav)
        setWhiteSidenav(dispatch, narrow ? false : whiteSidenav);
    };

    window.addEventListener("resize", handleMini);
    handleMini();

    return () => window.removeEventListener("resize", handleMini);
  }, [dispatch, miniSidenav, transparentSidenav, whiteSidenav]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const filtered = routes.filter(
    (r) =>
      r.type !== "collapse" || // tiêu đề / divider luôn hiển thị
      !r.allowedRoles || // không ràng buộc
      r.allowedRoles.some((role) => hasRole(role))
  );

  const renderRoutes = filtered.map(
    ({ type, name, icon, title, noCollapse, key, href, route }) => {
      let returnValue;

      if (type === "collapse") {
        returnValue = href ? (
          <Link
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </Link>
        ) : (
          <NavLink key={key} to={route}>
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
            />
          </NavLink>
        );
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      {/* Enhanced Header */}
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        {/* Close button for mobile */}
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>

        {/* Toggle button for desktop */}
        {!miniSidenav && (
          <MDBox
            position="absolute"
            top={0}
            right={0}
            p={1.625}
            onClick={toggleSidenav}
            sx={{ 
              cursor: "pointer",
              display: { xs: "none", xl: "block" },
              opacity: 0.7,
              "&:hover": { opacity: 1 }
            }}
          >
            <Tooltip title="Collapse sidebar">
              <ChevronLeftIcon sx={{ color: textColor, fontSize: "1.2rem" }} />
            </Tooltip>
          </MDBox>
        )}

        {/* Brand Logo and Name */}
        <MDBox component={NavLink} to="/admin" display="flex" alignItems="center" sx={{ textDecoration: "none" }}>
          {brand && (
            <MDBox 
              component="img" 
              src={brand} 
              alt="Brand" 
              width="2rem" 
              sx={{ 
                borderRadius: 1,
                mr: miniSidenav ? 0 : 1,
                transition: "all 0.3s ease"
              }}
            />
          )}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography
              component="h6"
              variant="button"
              fontWeight="medium"
              color={textColor}
              sx={{
                fontSize: miniSidenav ? "0.8rem" : "0.9rem",
                transition: "all 0.3s ease"
              }}
            >
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />

      {/* Enhanced User Profile Section */}
      {auth?.user && !miniSidenav && (
        <MDBox px={3} py={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-1px)",
              }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: "0.9rem",
                fontWeight: "bold"
              }}
            >
              {auth.user.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: textColor,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {auth.user.username}
              </Typography>
              <Chip
                label={auth.user.roles?.[0] || "User"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: textColor,
                  "& .MuiChip-label": {
                    px: 1
                  }
                }}
              />
            </Box>
          </Box>
        </MDBox>
      )}

      {/* Navigation Menu */}
      <List sx={{ px: 1 }}>{renderRoutes}</List>

      {/* Enhanced Footer Actions */}
      <MDBox sx={{ mt: "auto", p: 2 }}>
        {!miniSidenav ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <MDButton
              component={NavLink}
              to="/admin/profile"
              variant="outlined"
              color="white"
              size="small"
              startIcon={<PersonIcon />}
              sx={{
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: textColor,
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  bgcolor: "rgba(255, 255, 255, 0.1)"
                }
              }}
            >
              Profile
            </MDButton>
            <MDButton
              onClick={logout}
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              sx={{
                borderColor: "rgba(244, 67, 54, 0.5)",
                color: "#f44336",
                "&:hover": {
                  borderColor: "#f44336",
                  bgcolor: "rgba(244, 67, 54, 0.1)"
                }
              }}
            >
              Logout
            </MDButton>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
            <Tooltip title="Profile" placement="right">
              <IconButton
                component={NavLink}
                to="/admin/profile"
                size="small"
                sx={{ color: textColor }}
              >
                <PersonIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout" placement="right">
              <IconButton
                onClick={logout}
                size="small"
                sx={{ color: "#f44336" }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;