import { lazy, Suspense } from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import CleanAdminLayout from "layouts/CleanAdminLayout";

// Enhanced lazy loading with better error handling and preloading
const AdminDashboard = lazy(() => 
  import("pages/Admin/AdminDashboard/AdminDashboard.jsx").catch(err => {
    console.error("Failed to load AdminDashboard:", err);
    return { default: () => <Alert severity="error">Failed to load Admin Dashboard</Alert> };
  })
);

const OrderManagement = lazy(() => 
  import("pages/Admin/OrderManagement").catch(err => {
    console.error("Failed to load OrderManagement:", err);
    return { default: () => <Alert severity="error">Failed to load Order Management</Alert> };
  })
);

const ProductManagement = lazy(() => 
  import("pages/Admin/ProductManagement").catch(err => {
    console.error("Failed to load ProductManagement:", err);
    return { default: () => <Alert severity="error">Failed to load Product Management</Alert> };
  })
);

const UnitManagement = lazy(() => 
  import("pages/Admin/UnitManagement").catch(err => {
    console.error("Failed to load UnitManagement:", err);
    return { default: () => <Alert severity="error">Failed to load Unit Management</Alert> };
  })
);

const UserManagement = lazy(() => 
  import("pages/Admin/UserManagement").catch(err => {
    console.error("Failed to load UserManagement:", err);
    return { default: () => <Alert severity="error">Failed to load User Management</Alert> };
  })
);

const Reports = lazy(() => 
  import("pages/Admin/Reports").catch(err => {
    console.error("Failed to load Reports:", err);
    return { default: () => <Alert severity="error">Failed to load Reports</Alert> };
  })
);

const CategoryManagement = lazy(() => 
  import("pages/Admin/CategoryManagement").catch(err => {
    console.error("Failed to load CategoryManagement:", err);
    return { default: () => <Alert severity="error">Failed to load Category Management</Alert> };
  })
);

const AdminProfile = lazy(() => 
  import("pages/Admin/Profile").catch(err => {
    console.error("Failed to load AdminProfile:", err);
    return { default: () => <Alert severity="error">Failed to load Profile</Alert> };
  })
);

// Enhanced loading component with better UX
const EnhancedLoading = ({ message = "Loading..." }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: 2,
    }}
  >
    <CircularProgress 
      size={48} 
      thickness={4}
      sx={{
        color: "primary.main",
        animationDuration: "1.2s",
      }}
    />
    <Typography 
      variant="body1" 
      color="text.secondary"
      sx={{ fontWeight: 500 }}
    >
      {message}
    </Typography>
  </Box>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Alert 
    severity="error" 
    sx={{ 
      m: 2,
      borderRadius: 2,
      "& .MuiAlert-message": {
        width: "100%"
      }
    }}
    action={
      <button onClick={resetErrorBoundary} style={{ 
        background: "none", 
        border: "1px solid currentColor", 
        borderRadius: "4px",
        padding: "4px 8px",
        cursor: "pointer",
        color: "inherit"
      }}>
        Retry
      </button>
    }
  >
    <Typography variant="subtitle2" gutterBottom>
      Something went wrong loading this page
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {error?.message || "An unexpected error occurred"}
    </Typography>
  </Alert>
);

/**
 * Enhanced Higher-order component to wrap admin pages with CleanAdminLayout
 * Includes error boundaries, suspense, and better loading states
 * @param {React.Component} Component - The component to wrap
 * @param {string} titleKey - Translation key for the page title
 * @param {string} icon - Material-UI icon name
 * @param {string} loadingMessage - Custom loading message
 * @returns {Object} Route configuration object
 */
const withCleanAdminLayout = (Component, titleKey, icon = "dashboard", loadingMessage) => ({
  element: (
    <CleanAdminLayout titleKey={titleKey} icon={icon}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error("Admin page error:", error, errorInfo);
          // You can integrate with error reporting service here
        }}
        onReset={() => {
          // Clear any error state if needed
          window.location.reload();
        }}
      >
        <Suspense fallback={<EnhancedLoading message={loadingMessage} />}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    </CleanAdminLayout>
  ),
});

/**
 * Enhanced Admin routes configuration with CleanAdminLayout
 * All routes require 'admin' role and include enhanced error handling
 */
export const adminRoutes = [
  {
    path: "admin",
    element: (
      <CleanAdminLayout titleKey="nav.adminDashboard" icon="dashboard">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error("Admin page error:", error, errorInfo);
          }}
          onReset={() => {
            window.location.reload();
          }}
        >
          <Suspense fallback={<EnhancedLoading message="Loading dashboard..." />}>
            <AdminDashboard />
          </Suspense>
        </ErrorBoundary>
      </CleanAdminLayout>
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Admin Dashboard",
      description: "Overview of system statistics and quick actions",
      priority: 1,
    },
  },
  {
    path: "order-management",
    ...withCleanAdminLayout(
      OrderManagement, 
      "nav.orderManagement", 
      "assignment",
      "Loading orders..."
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Order Management",
      description: "Manage and track all system orders",
      priority: 2,
    },
  },
  {
    path: "category-management",
    ...withCleanAdminLayout(
      CategoryManagement, 
      "nav.categoryManagement", 
      "category",
      "Loading categories..."
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Category Management",
      description: "Organize products into categories",
      priority: 3,
    },
  },
  {
    path: "product-management",
    ...withCleanAdminLayout(
      ProductManagement, 
      "nav.productManagement", 
      "inventory",
      "Loading products..."
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Product Management",
      description: "Manage product catalog and inventory",
      priority: 4,
    },
  },
  {
    path: "unit-management",
    ...withCleanAdminLayout(
      UnitManagement, 
      "nav.unitManagement", 
      "straighten",
      "Loading units..."
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Unit Management",
      description: "Define measurement units for products",
      priority: 5,
    },
  },
  {
    path: "user-management",
    ...withCleanAdminLayout(
      UserManagement, 
      "nav.userManagement", 
      "people",
      "Loading users..."
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "User Management",
      description: "Manage system users and permissions",
      priority: 6,
    },
  },
  {
    path: "reports",
    ...withCleanAdminLayout(
      Reports, 
      "nav.reports", 
      "bar_chart",
      "Loading reports..."
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Reports & Analytics",
      description: "View system reports and analytics",
      priority: 7,
    },
  },
  {
    path: "profile",
    element: (
      <CleanAdminLayout titleKey="nav.profile" icon="person">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error("Admin profile error:", error, errorInfo);
          }}
          onReset={() => {
            window.location.reload();
          }}
        >
          <Suspense fallback={<EnhancedLoading message="Loading profile..." />}>
            <AdminProfile />
          </Suspense>
        </ErrorBoundary>
      </CleanAdminLayout>
    ),
    allowedRoles: ["admin"],
    meta: {
      title: "Profile",
      description: "Manage your profile settings",
      priority: 8,
    },
  },
];

// Export utility functions for route management
export const getRouteByPath = (path) => 
  adminRoutes.find(route => route.path === path);

export const getRoutesByPriority = () => 
  [...adminRoutes].sort((a, b) => (a.meta?.priority || 999) - (b.meta?.priority || 999));

export const preloadAdminRoutes = () => {
  // Preload critical routes after initial load
  setTimeout(() => {
    import("pages/Admin/AdminDashboard/AdminDashboard.jsx");
    import("pages/Admin/OrderManagement");
  }, 2000);
};