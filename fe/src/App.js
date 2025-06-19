import { useMemo, useContext, useEffect, useState, Suspense } from "react";
import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  Box,
  CircularProgress,
  Icon,
} from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
  setLayout,
} from "context";
import { AuthContext } from "context/AuthContext";
import ProtectedRoute from "routes/ProtectedRoute";

import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import PageLayout from "examples/LayoutContainers/PageLayout";
import MDBox from "components/template/MDBox";

import lightTheme from "assets/theme";
import darkTheme from "assets/theme-dark";
import themeRTL from "assets/theme/theme-rtl";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

import routes from "routes";
import "react-toastify/dist/ReactToastify.css";
import "./i18n"; // Initialize i18n

const Loading = () => (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress size={60} />
  </Box>
);

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentSidenav,
    whiteSidenav,
    sidenavColor,
    darkMode,
    direction,
    layout,
    openConfigurator,
  } = controller;

  const { auth, authLoading, hasRole } = useContext(AuthContext);
  const { pathname } = useLocation();
  const isAuthScreen = pathname.startsWith("/auth");

  const baseTheme =
    direction === "rtl"
      ? darkMode
        ? themeDarkRTL
        : themeRTL
      : darkMode
      ? darkTheme
      : lightTheme;

  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          transparent: { main: "rgba(0,0,0,0)" },
        },
      }),
    [baseTheme]
  );

  useEffect(() => {
    const next = isAuthScreen ? "page" : "dashboard";
    if (layout !== next) setLayout(dispatch, next);
  }, [isAuthScreen, layout, dispatch]);

  const allowedRoutes = useMemo(() => {
    if (!auth?.token) return routes;
    const roles = (auth.user?.roles || []).map((r) =>
      r.toLowerCase().replace(/^role_/, "")
    );
    return routes.filter(
      (r) =>
        !r.allowedRoles ||
        r.allowedRoles.some((ar) => roles.includes(ar.toLowerCase()))
    );
  }, [auth?.token, auth?.user?.roles]);

  const wrap = (node) =>
    node.allowedRoles ? (
      <ProtectedRoute allowedRoles={node.allowedRoles}>
        {node.element}
      </ProtectedRoute>
    ) : (
      node.element
    );

  const buildRoutes = (nodes, prefix = "") =>
    nodes.flatMap((n) => {
      const key = `${prefix}${n.key || Math.random()}`;
      const path = n.path ?? "";

      if (n.index) return <Route key={key} index element={wrap(n)} />;
      if (n.children?.length)
        return (
          <Route key={key} path={path} element={wrap(n)}>
            {buildRoutes(n.children, `${key}-`)}
          </Route>
        );
      return <Route key={key} path={path} element={wrap(n)} />;
    });

  const routeElements = useMemo(
    () => buildRoutes(allowedRoutes),
    [allowedRoutes]
  );

  // Simplified sidebar logic - removed hover behavior to avoid conflicts with manual toggle
  const handleEnter = () => {
    // Hover behavior disabled to prevent conflicts with manual toggle
  };
  
  const handleLeave = () => {
    // Hover behavior disabled to prevent conflicts with manual toggle
  };

  const toggleConfigurator = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  if (authLoading) return <Loading />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {!isAuthScreen &&
        auth?.user?.roles?.some(role => role.toLowerCase() === "admin") &&
        layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={
                (transparentSidenav && !darkMode) || whiteSidenav
                  ? "/assets/images/logo-ct-dark.png"
                  : "/assets/images/logo-ct.png"
              }
              brandName="Stationery Management"
              routes={allowedRoutes}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            />
            <Configurator />
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="3.25rem"
              height="3.25rem"
              bgColor="white"
              shadow="sm"
              borderRadius="50%"
              position="fixed"
              right="2rem"
              bottom="2rem"
              zIndex={99}
              color="dark"
              sx={{ cursor: "pointer" }}
              onClick={toggleConfigurator}
            >
              <Icon fontSize="small">settings</Icon>
            </MDBox>
          </>
        )}

      <Suspense fallback={<Loading />}>
        <Routes>{routeElements}</Routes>
      </Suspense>
    </ThemeProvider>
  );
}