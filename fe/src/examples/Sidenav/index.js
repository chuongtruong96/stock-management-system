import { useContext, useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { AuthContext } from "context/AuthContext";
import PropTypes from "prop-types";

// @mui material components
import {
  List,
  Divider,
  Link,
  Icon,
  Box,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Fade,
  alpha,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

  const collapseName = location.pathname.replace("/", "");

  // Force white text for gradient background
  const textColor = "white";
  const iconColor = textColor;

  const closeSidenav = () => setMiniSidenav(dispatch, true);
  const toggleSidenav = () => setMiniSidenav(dispatch, !miniSidenav);

  useEffect(() => {
    function handleMini() {
      const narrow = window.innerWidth < 1200;
      setIsMobile(narrow);

      // Update transparent and white sidenav based on screen size
      if ((narrow ? false : transparentSidenav) !== transparentSidenav)
        setTransparentSidenav(dispatch, narrow ? false : transparentSidenav);
      if ((narrow ? false : whiteSidenav) !== whiteSidenav)
        setWhiteSidenav(dispatch, narrow ? false : whiteSidenav);
    }

    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleMini, 150);
    };

    window.addEventListener("resize", debouncedResize);
    handleMini();

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [dispatch, transparentSidenav, whiteSidenav]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const filtered = routes.filter(
    (r) =>
      r.type !== "collapse" ||
      !r.allowedRoles ||
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
            display={miniSidenav ? "none" : "block"}
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={3}
            mb={1}
            ml={1}
            sx={{
              opacity: miniSidenav ? 0 : 1,
              visibility: miniSidenav ? "hidden" : "visible",
              transition: "all 0.3s ease",
              overflow: "hidden",
              whiteSpace: "nowrap",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            sx={{
              my: 2,
              mx: 2,
              borderColor: alpha("rgba(255,255,255,1)", 0.2),
            }}
          />
        );
      }

      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? !miniSidenav : true}
      onClose={() => isMobile && setMiniSidenav(dispatch, true)}
      ModalProps={{
        keepMounted: true,
        ...(isMobile && {
          BackdropProps: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
            },
          },
        }),
      }}
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      {/* Header Section */}
      <MDBox>
        {/* Mobile close button */}
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={8}
          right={8}
          p={1}
          onClick={closeSidenav}
          sx={{
            cursor: "pointer",
            borderRadius: 1,
            zIndex: 10,
            "&:hover": {
              bgcolor: alpha("rgba(255,255,255,1)", 0.1),
            },
          }}
        >
          <Icon sx={{ color: iconColor, fontSize: "1.25rem" }}>close</Icon>
        </MDBox>

        {/* Desktop toggle button */}
        {!miniSidenav && (
          <MDBox
            position="absolute"
            top={8}
            right={8}
            p={1}
            onClick={toggleSidenav}
            sx={{
              cursor: "pointer",
              display: { xs: "none", xl: "block" },
              borderRadius: 1,
              opacity: 0.7,
              zIndex: 10,
              transition: "all 0.2s ease",
              "&:hover": {
                opacity: 1,
                bgcolor: alpha("rgba(255,255,255,1)", 0.1),
              },
            }}
          >
            <Tooltip title="Collapse sidebar" placement="bottom">
              <ChevronLeftIcon sx={{ color: iconColor, fontSize: "1.25rem" }} />
            </Tooltip>
          </MDBox>
        )}

        {/* Brand Section */}
        <MDBox
          component={NavLink}
          to="/admin"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            p: 2,
            mx: 1,
            mt: 1,
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: alpha("rgba(255,255,255,1)", 0.1),
              transform: "translateY(-1px)",
            },
          }}
        >
          {brand && (
            <MDBox
              component="img"
              src={brand}
              alt="Brand Logo"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                mr: miniSidenav ? 0 : 1.5,
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            />
          )}
          {!miniSidenav && (
            <MDBox sx={{ flex: 1, minWidth: 0 }}>
              <MDTypography
                variant="h6"
                color={textColor}
                sx={{
                  fontWeight: 700,
                  fontSize: brandName && brandName.length > 15 ? "0.9rem" : "1.1rem",
                  letterSpacing: "0.5px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {brandName}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>

        {/* User Profile Section */}
        {auth?.user && (
          <MDBox
            sx={{
              mx: 1,
              mb: 0.5,
              p: miniSidenav ? 1 : 2,
              borderRadius: 2,
              bgcolor: alpha("rgba(255,255,255,1)", 0.1),
              border: `1px solid ${alpha("rgba(255,255,255,1)", 0.15)}`,
              transition: "all 0.3s ease",
            }}
          >
            {miniSidenav ? (
              // Collapsed view - just avatar with tooltip
              <Tooltip title={`${auth.user.username} (${auth.user.roles?.[0] || "User"})`} placement="right">
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: alpha("rgba(255,255,255,1)", 0.2),
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                  >
                    {auth.user.username?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </Box>
              </Tooltip>
            ) : (
              // Expanded view - full profile
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha("rgba(255,255,255,1)", 0.2),
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    flexShrink: 0,
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
                      fontSize: "0.875rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mb: 0.25,
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
                      fontWeight: 500,
                      bgcolor: alpha("rgba(255,255,255,1)", 0.2),
                      color: textColor,
                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                </Box>
              </Box>
            )}
          </MDBox>
        )}
      </MDBox>

      {/* Divider */}
      <Divider
        sx={{
          mx: 1,
          my: 1,
          borderColor: alpha("rgba(255,255,255,1)", 0.2),
        }}
      />

      {/* Navigation Menu */}
      <List sx={{ px: 1, pt: 0, pb: 2, flex: 1 }}>{renderRoutes}</List>

      {/* Footer Actions */}
      <MDBox sx={{ mt: "auto", p: 2 }}>
        <Divider
          sx={{
            mb: 2,
            borderColor: alpha("rgba(255,255,255,1)", 0.2),
          }}
        />
        {!miniSidenav ? (
          <Fade in={!miniSidenav} timeout={300}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <MDButton
                component={NavLink}
                to="/profile"
                variant="outlined"
                color="white"
                size="small"
                startIcon={<PersonIcon />}
                sx={{
                  borderColor: alpha("rgba(255,255,255,1)", 0.3),
                  color: textColor,
                  fontWeight: 500,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: alpha("rgba(255,255,255,1)", 0.5),
                    bgcolor: alpha("rgba(255,255,255,1)", 0.1),
                  },
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
                  borderColor: alpha("#f44336", 0.5),
                  color: "#f44336",
                  fontWeight: 500,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#f44336",
                    bgcolor: alpha("#f44336", 0.1),
                  },
                }}
              >
                Logout
              </MDButton>
            </Box>
          </Fade>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <Tooltip title="Profile" placement="right">
              <IconButton
                component={NavLink}
                to="/profile"
                size="small"
                sx={{
                  color: iconColor,
                  "&:hover": {
                    bgcolor: alpha("rgba(255,255,255,1)", 0.1),
                  },
                }}
              >
                <PersonIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout" placement="right">
              <IconButton
                onClick={logout}
                size="small"
                sx={{
                  color: "#f44336",
                  "&:hover": {
                    bgcolor: alpha("#f44336", 0.1),
                  },
                }}
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