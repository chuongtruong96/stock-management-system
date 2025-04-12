import { useState, useEffect,useContext } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
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
  StockManagement,
  UnitManagement,
  UserManagement,
  Reports,
} from "./pages";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/App.css";
import { Button, Box, CircularProgress, Typography } from "@mui/material";

const App = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  // Persist language in localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // PrivateRoute component using AuthContext
  const PrivateRoute = ({ children, allowedRoles }) => {
    const { auth, authLoading } = useContext(AuthContext);

    if (authLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            backgroundColor: "#f5f5f5",
          }}
        >
          <CircularProgress size={60} color="primary" />
          <Typography variant="h6" sx={{ mt: 2, color: "#1976d2" }}>
            {language === "vi" ? "Đang tải..." : "Loading..."}
          </Typography>
        </Box>
      );
    }

    if (!auth.token) {
      toast.error(
        language === "vi"
          ? "Vui lòng đăng nhập để tiếp tục."
          : "Please log in to continue.",
        { position: "top-right", autoClose: 3000 }
      );
      return <Navigate to="/login" />;
    }

    const userRole = auth.user?.roles?.[0]?.toLowerCase(); // No need to replace "ROLE_"    
    const hasAccess = userRole === "admin" || allowedRoles.includes(userRole);
    if (!userRole || !hasAccess) {
      toast.warn(
        language === "vi"
          ? "Bạn không có quyền truy cập trang này."
          : "You do not have permission to access this page.",
        { position: "top-right", autoClose: 3000 }
      );
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

  return (
    <AuthProvider>
      <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Sidebar (only on protected routes) */}
        {window.location.pathname !== "/login" && (
          <AuthContext.Consumer>
            {({ auth }) => (
              <Sidebar
                open={sidebarOpen}
                toggleSidebar={toggleSidebar}
                userRole={auth.user?.roles?.[0]?.replace("ROLE_", "").toLowerCase()}
                language={language}
              />
            )}
          </AuthContext.Consumer>
        )}

        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Navbar (only on protected routes) */}
          {window.location.pathname !== "/login" && (
            <AuthContext.Consumer>
              {({ auth, logout }) => (
                <Navbar
                userRole={auth.user?.roles?.[0]?.toLowerCase()} // Removed replace("ROLE_", "")                  
                language={language}
                  setLanguage={setLanguage}
                  handleLogout={() => {
                    logout();
                    toast.success(
                      language === "vi"
                        ? "Đăng xuất thành công!"
                        : "Logged out successfully!",
                      { position: "top-right", autoClose: 2000 }
                    );
                    navigate("/login");
                  }}
                  toggleSidebar={toggleSidebar}
                  username={auth.user?.username || "User"}
                />
              )}
            </AuthContext.Consumer>
          )}

          {/* Add padding to account for fixed Navbar */}
          <Box sx={{ mt: 8, p: 3 }}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <Login language={language} setLanguage={setLanguage} />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={["admin", "user"]}>
                    <AuthContext.Consumer>
                      {({ auth }) => {
                        const userRole = auth.user?.roles?.[0]?.replace("ROLE_", "").toLowerCase();
                        return userRole === "admin" ? (
                          <AdminDashboard language={language} />
                        ) : (
                          <UserDashboard language={language} />
                        );
                      }}
                    </AuthContext.Consumer>
                  </PrivateRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="/products"
                element={
                  <PrivateRoute allowedRoles={["user"]}>
                    <ProductList language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-form"
                element={
                  <PrivateRoute allowedRoles={["user"]}>
                    <OrderForm language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/order-history"
                element={
                  <PrivateRoute allowedRoles={["user"]}>
                    <OrderHistory language={language} />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/order-management"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <OrderManagement language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/product-management"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <ProductManagement language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock-management"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <StockManagement language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/unit-management"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <UnitManagement language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user-management"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <UserManagement language={language} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/import-order"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <div>Import Orders Page (Placeholder)</div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <Reports language={language} />
                  </PrivateRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Fallback Route for 404 */}
              <Route
                path="*"
                element={
                  <Box sx={{ textAlign: "center", mt: 5 }}>
                    <Typography variant="h4" color="error">
                      {language === "vi"
                        ? "Trang Không Tìm Thấy"
                        : "Page Not Found"}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, color: "#666" }}>
                      {language === "vi"
                        ? "Trang bạn đang tìm kiếm không tồn tại."
                        : "The page you are looking for does not exist."}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate("/dashboard")}
                      sx={{ mt: 3, textTransform: "none", px: 4, py: 1 }}
                    >
                      {language === "vi"
                        ? "Quay Lại Trang Chủ"
                        : "Go to Dashboard"}
                    </Button>
                  </Box>
                }
              />
            </Routes>
          </Box>
        </Box>
      </Box>
    </AuthProvider>
  );
};

export default App;