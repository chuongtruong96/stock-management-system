/*  src/App.js  */
import React, { useMemo, useContext, useEffect, useState } from "react";
import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  Box,
  CircularProgress,
  Icon,
} from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";

import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
  setLayout,
} from "context";
import { AuthContext }  from "context/AuthContext";
import ProtectedRoute   from "components/ProtectedRoute";

import Sidenav          from "examples/Sidenav";
import Configurator     from "examples/Configurator";
import DashboardLayout  from "examples/LayoutContainers/DashboardLayout";
import PageLayout       from "examples/LayoutContainers/PageLayout";
import MDBox            from "components/MDBox";

import lightTheme   from "assets/theme";
import darkTheme    from "assets/theme-dark";
import themeRTL     from "assets/theme/theme-rtl";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import routes       from "./routes";

import brandWhite   from "assets/images/logo-ct.png";
import brandDark    from "assets/images/logo-ct-dark.png";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------- tiny helpers ---------- */
const Loading = () => (
  <Box sx={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <CircularProgress size={60}/>
  </Box>
);

/* ==================================================================== */
export default function App() {
  /* ------------------ global ui controller ------------------ */
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav, transparentSidenav, whiteSidenav,
    sidenavColor, darkMode, direction, layout, openConfigurator,
  } = controller;

  /* ------------------ theme ------------------ */
  const baseTheme =
    direction === "rtl"
      ? darkMode ? themeDarkRTL : themeRTL
      : darkMode ? darkTheme    : lightTheme;

  const theme = useMemo(() => createTheme({
    ...baseTheme,
    palette:{ ...baseTheme.palette, transparent:{ main:"rgba(0,0,0,0)" } },
  }), [baseTheme]);

  /* ------------------ auth & location ------------------ */
  const { auth, authLoading } = useContext(AuthContext);
  const { pathname } = useLocation();
  const isAuthScreen = pathname.startsWith("/auth");

  /* page / dashboard layout flag */
  useEffect(() => {
    const next = isAuthScreen ? "page" : "dashboard";
    if (layout !== next) setLayout(dispatch, next);
  }, [isAuthScreen, layout, dispatch]);

  /* ------------------ build & memo routes ------------------ */
  const allowedRoutes = useMemo(() => {
    if (!auth?.token) return routes;                // chưa đăng nhập
    const roles = (auth.user?.roles||[]).map(r=>r.toLowerCase().replace(/^role_/,""));
    return routes.filter(
      r => !r.allowedRoles || r.allowedRoles.some(ar=>roles.includes(ar.toLowerCase()))
    );
  }, [auth?.token, auth?.user?.roles]);

  /* bọc element nếu route có ràng buộc quyền */
  const wrap = (node) =>
    node.allowedRoles
      ? <ProtectedRoute allowedRoles={node.allowedRoles}>{node.element}</ProtectedRoute>
      : node.element;

  /* đệ quy dựng <Route/>; truyền thêm prefix để bảo đảm key unique */
  const buildRoutes = (nodes, prefix="") =>
    nodes.flatMap((n) => {
      const key  = `${prefix}${n.key || Math.random()}`;

      // Index-route
      if (n.index) return <Route key={key} index element={wrap(n)} />;

      // Lấy path ("" nếu không có, để route lồng path trống)
      const path = n.path ?? "";

      // Có children → route lồng
      if (n.children?.length)
        return (
          <Route key={key} path={path} element={wrap(n)}>
            {buildRoutes(n.children, `${key}-`)}
          </Route>
        );

      // Route thường
      return <Route key={key} path={path} element={wrap(n)} />;
    });

  const routeElements = useMemo(() => buildRoutes(allowedRoutes), [allowedRoutes]);

  /* ------------------ hover mở rộng mini-sidenav ------------------ */
  const [hovered, setHovered] = useState(false);
  const handleEnter = () => { if (miniSidenav && !hovered){ setMiniSidenav(dispatch,false); setHovered(true);} };
  const handleLeave = () => { if (hovered){ setMiniSidenav(dispatch,true); setHovered(false);} };

  const toggleConfigurator = () => setOpenConfigurator(dispatch, !openConfigurator);

  /* ------------------ loading until auth ready ------------------ */
  if (authLoading) return <Loading/>;

  /* ================================================================= */
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <ToastContainer position="top-right" autoClose={3000} theme="light"/>

      {/* ---------- SIDENAV chỉ admin ---------- */}
      {!isAuthScreen && auth?.user?.roles?.includes("ADMIN") && layout==="dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Stationery Management"
            routes={allowedRoutes}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />
          <Configurator/>

          <MDBox
            display="flex" justifyContent="center" alignItems="center"
            width="3.25rem" height="3.25rem" bgColor="white" shadow="sm"
            borderRadius="50%" position="fixed" right="2rem" bottom="2rem"
            zIndex={99} color="dark" sx={{ cursor:"pointer" }}
            onClick={toggleConfigurator}
          >
            <Icon fontSize="small">settings</Icon>
          </MDBox>
        </>
      )}

      {/* ---------- MAIN ---------- */}
      {isAuthScreen ? (
        <PageLayout>
          <Routes>{routeElements}</Routes>
        </PageLayout>
      ) : auth?.user?.roles?.includes("ADMIN") ? (
        <DashboardLayout>
          <Routes>{routeElements}</Routes>
        </DashboardLayout>
      ) : (
        /* UserLayout đã được định nghĩa trong cây route */
        <Routes>{routeElements}</Routes>
      )}
    </ThemeProvider>
  );
}
