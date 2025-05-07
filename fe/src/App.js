/*  src/App.js  */
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Icon, Box, CircularProgress } from "@mui/material";

/* template helpers */
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import PageLayout from "examples/LayoutContainers/PageLayout";
import MDBox from "components/MDBox";
import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
  setLayout,
} from "context";

import routes from "./routes";
import ProtectedRoute from "components/ProtectedRoute";

import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

import { ToastContainer } from "react-toastify";
import { AuthContext } from "context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

/* ------------ Splash while checking login ------------- */
function LoadingScreen() {
  return (
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
}

export default function App() {
  /* ---------- global UI controller ---------- */
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    layout,
    openConfigurator,
  } = controller;

  /* ---------- auth ---------- */
  const { auth, authLoading } = useContext(AuthContext);

  /* ---------- router ---------- */
  const { pathname } = useLocation();
  const isAuthScreen = pathname.startsWith("/auth");

  /* ---------- keep layout type ---------- */
  useEffect(() => {
    setLayout(dispatch, isAuthScreen ? "page" : "dashboard");
  }, [isAuthScreen, dispatch]);

  /* ---------- sidenav hover ---------- */
  const [hovered, setHovered] = useState(false);
  const handleEnter = () => {
    if (miniSidenav && !hovered) {
      setMiniSidenav(dispatch, false);
      setHovered(true);
    }
  };
  const handleLeave = () => {
    if (hovered) {
      setMiniSidenav(dispatch, true);
      setHovered(false);
    }
  };
  const toggleConfigurator = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  /* ---------- filter routes theo quyền ---------- */
  const filteredRoutes = useMemo(() => {
    if (!auth?.token) return routes; // chưa login → chỉ các route public
    const roles = (auth.user?.roles || []).map((r) =>
      r.toLowerCase().replace(/^role_/, "")
    );
    return routes.filter(
      (r) =>
        !r.allowedRoles ||
        r.allowedRoles.some((ar) => roles.includes(ar.toLowerCase()))
    );
  }, [auth?.token, auth?.user?.roles]);

  /* ---------- helper render <Route/> ---------- */
  const renderRoutes = (list) =>
    list.map((r) => {
      if (!r.route || !r.component) return null;

      const element = r.allowedRoles ? (
        <ProtectedRoute allowedRoles={r.allowedRoles}>
          {r.component}
        </ProtectedRoute>
      ) : (
        r.component
      );

      return <Route key={r.key} path={r.route} element={element} />;
    });

  /* ---------- loading while checking localStorage ---------- */
  if (authLoading) return <LoadingScreen />;

  /* ---------- UI ---------- */
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* ---------- S I D E N A V ---------- */}
      {!isAuthScreen && auth?.token && layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={
              (transparentSidenav && !darkMode) || whiteSidenav
                ? brandDark
                : brandWhite
            }
            brandName="Stationery Management"
            routes={routes}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          />

          <Configurator />

          {/* floating button mở configurator */}
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

      {/* ---------- MAIN ---------- */}
      {isAuthScreen ? (
        <PageLayout>
          <Routes>{renderRoutes(filteredRoutes)}</Routes>
        </PageLayout>
      ) : (
        <DashboardLayout>
          <Routes>{renderRoutes(filteredRoutes)}</Routes>
        </DashboardLayout>
      )}
    </>
  );
}
