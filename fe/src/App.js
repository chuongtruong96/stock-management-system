import React, { useState, useEffect, useContext } from "react";
import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import DashboardLayout from "./mui-dashboard/scr/";  // layout từ template

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import {
  Login,
  AdminDashboard,
  UserDashboard,
  ProductList,
  OrderForm,
  OrderHistory,
  OrderManagement,
  ProductManagement,
  UnitManagement,
  UserManagement,
  Reports,
  NotificationsPage,
  SummaryDashboard
} from "./pages";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/App.css";
import "./assets/styles/custom.css";
import { Button, Box, CircularProgress, Typography } from "@mui/material";

import WsProvider from "./contexts/WsContext";

/* ───────────────────────────────── PrivateRoute ─────────────────────────── */
const PrivateRoute = ({ children, allowedRoles, language }) => {
  const { auth, authLoading } = useContext(AuthContext);
  const [redirect, setRedirect] = useState(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!authLoading && !auth.token && !shown) {
      toast.error(
        language === "vi"
          ? "Vui lòng đăng nhập để tiếp tục."
          : "Please log in to continue."
      );
      setShown(true);
      setRedirect("/login");
    } else if (!authLoading && auth.token) {
      const role = auth.user?.roles?.[0]?.toLowerCase();
      const ok = role === "admin" || allowedRoles.includes(role);
      if (!ok && !shown) {
        toast.warn(
          language === "vi"
            ? "Bạn không có quyền truy cập trang này."
            : "You do not have permission to access this page."
        );
        setShown(true);
        setRedirect("/dashboard");
      }
    }
  }, [auth, authLoading, allowedRoles, language, shown]);

  if (authLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>
          {language === "vi" ? "Đang tải..." : "Loading..."}
        </Typography>
      </Box>
    );
  }

  if (redirect) return <Navigate to={redirect} />;

  return children;
};

/* ─────────────────────────────────── App ─────────────────────────────────── */
const App = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";

  /* lưu ngôn ngữ */
  useEffect(() => localStorage.setItem("language", language), [language]);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  return (
    <WsProvider>
      <AuthProvider>
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
          <ToastContainer position="top-right" autoClose={3000} theme="light" />

          {/* ─────────────── Sidebar ─────────────── */}
          {!isLogin && (
            <AuthContext.Consumer>
              {({ auth }) => (
                <Sidebar
                  open={sidebarOpen}
                  toggleSidebar={toggleSidebar}
                  userRole={auth.user?.roles?.[0]
                    ?.replace("ROLE_", "")
                    .toLowerCase()}
                  language={language}
                />
              )}
            </AuthContext.Consumer>
          )}

          {/* ─────────────── Main area ─────────────── */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Navbar */}
            {!isLogin && (
              <AuthContext.Consumer>
                {({ auth, logout }) => (
                  <Navbar
                    userRole={auth.user?.roles?.[0]?.toLowerCase()}
                    language={language}
                    setLanguage={setLanguage}
                    toggleSidebar={toggleSidebar}
                    username={auth.user?.username || "User"}
                    handleLogout={() => {
                      logout();
                      toast.success(
                        language === "vi"
                          ? "Đăng xuất thành công!"
                          : "Logged out!"
                      );
                      navigate("/login");
                    }}
                  />
                )}
              </AuthContext.Consumer>
            )}

            {/* Content */}
            <Box sx={{ mt: isLogin ? 0 : 8, p: 3 }}>
              <Routes>
                {/* Auth */}
                <Route
                  path="/login"
                  element={
                    <Login language={language} setLanguage={setLanguage} />
                  }
                />
                <Route path="/reset/:token" element={<ResetPassword />} />

                {/* Dashboards */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute
                      allowedRoles={["admin", "user"]}
                      language={language}
                    >
                      <AuthContext.Consumer>
                        {({ auth }) => {
                          const role = auth.user?.roles?.[0]
                            ?.replace("ROLE_", "")
                            .toLowerCase();
                          return role === "admin" ? (
                            <AdminDashboard language={language} />
                          ) : (
                            <UserDashboard language={language} />
                          );
                        }}
                      </AuthContext.Consumer>
                    </PrivateRoute>
                  }
                />

                {/* Users */}
                <Route
                  path="/products"
                  element={
                    <PrivateRoute allowedRoles={["user"]} language={language}>
                      <ProductList language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/order-form"
                  element={
                    <PrivateRoute allowedRoles={["user"]} language={language}>
                      <OrderForm language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/order-history"
                  element={
                    <PrivateRoute allowedRoles={["user"]} language={language}>
                      <OrderHistory language={language} />
                    </PrivateRoute>
                  }
                />

                {/* Admin */}
                <Route
                  path="/order-management"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <OrderManagement language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/product-management"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <ProductManagement language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/unit-management"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <UnitManagement language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <UserManagement language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/import-order"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <div>Import Orders Page (Placeholder)</div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <Reports language={language} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute
                      allowedRoles={["admin", "user"]}
                      language={language}
                    >
                      <NotificationsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/summaries"
                  element={
                    <PrivateRoute allowedRoles={["admin"]} language={language}>
                      <SummaryDashboard />
                    </PrivateRoute>
                  }
                />

                {/* default & 404 */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<NotFound language={language} />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </AuthProvider>
    </WsProvider>
  );
};

/* ─────────────── Trang 404 ─────────────── */
const NotFound = ({ language }) => (
  <Box sx={{ textAlign: "center", mt: 10 }}>
    <Typography variant="h4" color="error" gutterBottom>
      {language === "vi" ? "Trang Không Tìm Thấy" : "Page Not Found"}
    </Typography>
    <Button variant="contained" onClick={() => window.history.back()}>
      {language === "vi" ? "Quay lại" : "Go back"}
    </Button>
  </Box>
);

export default App;
