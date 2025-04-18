import { useState, useEffect, useContext } from "react";
import { Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
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
  UnitManagement,
  UserManagement,
  Reports,
} from "./pages";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/App.css";
import { Button, Box, CircularProgress, Typography } from "@mui/material";
import './assets/styles/custom.css';
const PrivateRoute = ({ children, allowedRoles, language }) => {
  const { auth, authLoading } = useContext(AuthContext);
  const [redirectPath, setRedirectPath] = useState(null);
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (!authLoading && !auth.token && !toastShown) {
      toast.error(
        language === "vi" ? "Vui lòng đăng nhập để tiếp tục." : "Please log in to continue."
      );
      setToastShown(true);
      setRedirectPath("/login");
    } else if (!authLoading && auth.token) {
      const userRole = auth.user?.roles?.[0]?.toLowerCase();
      const hasAccess = userRole === "admin" || allowedRoles.includes(userRole);
      if (!hasAccess && !toastShown) {
        toast.warn(
          language === "vi"
            ? "Bạn không có quyền truy cập trang này."
            : "You do not have permission to access this page."
        );
        setToastShown(true);
        setRedirectPath("/dashboard");
      }
    }
  }, [auth, authLoading, allowedRoles, language, toastShown]);

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column", backgroundColor: "#f5f5f5" }}>
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: "#1976d2" }}>
          {language === "vi" ? "Đang tải..." : "Loading..."}
        </Typography>
      </Box>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return children;
};

const App = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <AuthProvider>
      <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        {!isLoginPage && (
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

        <Box sx={{ flexGrow: 1 }}>
          {!isLoginPage && (
            <AuthContext.Consumer>
              {({ auth, logout }) => (
                <Navbar
                  userRole={auth.user?.roles?.[0]?.toLowerCase()}
                  language={language}
                  setLanguage={setLanguage}
                  handleLogout={() => {
                    logout();
                    toast.success(
                      language === "vi" ? "Đăng xuất thành công!" : "Logged out successfully!"
                    );
                    navigate("/login");
                  }}
                  toggleSidebar={toggleSidebar}
                  username={auth.user?.username || "User"}
                />
              )}
            </AuthContext.Consumer>
          )}

          <Box sx={{ mt: 8, p: 3 }}>
            <Routes>
              <Route path="/login" element={<Login language={language} setLanguage={setLanguage} />} />
              <Route path="/dashboard" element={
                <PrivateRoute allowedRoles={["admin", "user"]} language={language}>
                  <AuthContext.Consumer>
                    {({ auth }) => {
                      const role = auth.user?.roles?.[0]?.replace("ROLE_", "").toLowerCase();
                      return role === "admin" ? <AdminDashboard language={language} /> : <UserDashboard language={language} />;
                    }}
                  </AuthContext.Consumer>
                </PrivateRoute>
              } />
              <Route path="/products" element={<PrivateRoute allowedRoles={["user"]} language={language}><ProductList language={language} /></PrivateRoute>} />
              <Route path="/order-form" element={<PrivateRoute allowedRoles={["user"]} language={language}><OrderForm language={language} /></PrivateRoute>} />
              <Route path="/order-history" element={<PrivateRoute allowedRoles={["user"]} language={language}><OrderHistory language={language} /></PrivateRoute>} />
              <Route path="/order-management" element={<PrivateRoute allowedRoles={["admin"]} language={language}><OrderManagement language={language} /></PrivateRoute>} />
              <Route path="/product-management" element={<PrivateRoute allowedRoles={["admin"]} language={language}><ProductManagement language={language} /></PrivateRoute>} />
              <Route path="/unit-management" element={<PrivateRoute allowedRoles={["admin"]} language={language}><UnitManagement language={language} /></PrivateRoute>} />
              <Route path="/user-management" element={<PrivateRoute allowedRoles={["admin"]} language={language}><UserManagement language={language} /></PrivateRoute>} />
              <Route path="/import-order" element={<PrivateRoute allowedRoles={["admin"]} language={language}><div>Import Orders Page (Placeholder)</div></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute allowedRoles={["admin"]} language={language}><Reports language={language} /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={
                <Box sx={{ textAlign: "center", mt: 5 }}>
                  <Typography variant="h4" color="error">
                    {language === "vi" ? "Trang Không Tìm Thấy" : "Page Not Found"}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2, color: "#666" }}>
                    {language === "vi" ? "Trang bạn đang tìm kiếm không tồn tại." : "The page you are looking for does not exist."}
                  </Typography>
                  <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")} sx={{ mt: 3, textTransform: "none", px: 4, py: 1 }}>
                    {language === "vi" ? "Quay Lại Trang Chủ" : "Go to Dashboard"}
                  </Button>
                </Box>
              } />
            </Routes>
          </Box>
        </Box>
      </Box>
    </AuthProvider>
  );
};

export default App;