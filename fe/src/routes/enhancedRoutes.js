import { Navigate } from "react-router-dom";
import {
  HomePage,
  ProductsPage,
  ProductDetail,
  OrderForm,
  OrderHistory,
  OrderDetail,
  Profile,
  Notifications,
  AdminDashboard,
  CategoryManagement,
  OrderManagement,
  ProductManagement,
  UnitManagement,
  UserManagement,
  Reports,
} from "pages";
import SignIn from "layouts/authentication/sign-in";
import RoleRedirect from "routes/RoleRedirect";
import UserLayout from "layouts/user/UserLayout";
import NotificationPageWrapper from "pages/Notifications/NotificationPageWrapper";

const routes = [
  {
    path: "/",
    element: <RoleRedirect />,
  },
  // Auth
  {
    path: "auth/sign-in",
    element: <SignIn />,
    meta: { titleKey: "nav.signIn", icon: "login" },
  },
  // USER
  {
    path: "/",
    element: <UserLayout />,
    allowedRoles: ["user"],
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        key: "dash",
        element: <HomePage />,
        meta: { titleKey: "nav.dashboard", icon: "home" },
      },
      {
        path: "products",
        element: <ProductsPage />,
        meta: { titleKey: "nav.products", icon: "inventory" },
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
        meta: { titleKey: "nav.productDetail", icon: "info" },
      },
      {
        path: "order-form",
        element: <OrderForm />,
        meta: { titleKey: "nav.orderForm", icon: "assignment" },
      },
      {
        path: "order-history",
        element: <OrderHistory />,
        meta: { titleKey: "nav.orderHistory", icon: "history" },
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
        meta: { titleKey: "nav.orderDetail", icon: "receipt_long" },
      },
      {
        path: "profile",
        element: <Profile />,
        meta: { titleKey: "nav.profile", icon: "person" },
      },
      {
        path: "notifications",
        element: <Notifications />,
        meta: { titleKey: "nav.notifications", icon: "notifications" },
      },
    ],
  },

  // DASHBOARD SECTION
  {
    type: "title",
    title: "Dashboard",
    key: "dashboard-section",
  },
  {
    type: "collapse",
    name: "Admin Dashboard",
    key: "admin",
    icon: "dashboard",
    route: "/admin",
    path: "admin",
    element: <AdminDashboard />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.adminDashboard", 
      icon: "dashboard",
      description: "System overview and analytics"
    },
  },

  // ORDER MANAGEMENT SECTION
  {
    type: "title",
    title: "Order Management",
    key: "order-section",
  },
  {
    type: "collapse",
    name: "Order Management",
    key: "order-management",
    icon: "assignment_turned_in",
    route: "/order-management",
    path: "order-management",
    element: <OrderManagement />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.orderManagement", 
      icon: "assignment_turned_in",
      description: "Manage and track all orders"
    },
  },

  // INVENTORY SECTION
  {
    type: "title",
    title: "Inventory",
    key: "inventory-section",
  },
  {
    type: "collapse",
    name: "Product Management",
    key: "product-management",
    icon: "inventory_2",
    route: "/product-management",
    path: "product-management",
    element: <ProductManagement />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.productManagement", 
      icon: "inventory_2",
      description: "Manage product catalog"
    },
  },
  {
    type: "collapse",
    name: "Category Management",
    key: "category-management",
    icon: "category",
    route: "/category-management",
    path: "category-management",
    element: <CategoryManagement />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.categoryManagement", 
      icon: "category",
      description: "Organize product categories"
    },
  },
  {
    type: "collapse",
    name: "Unit Management",
    key: "unit-management",
    icon: "straighten",
    route: "/unit-management",
    path: "unit-management",
    element: <UnitManagement />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.unitManagement", 
      icon: "straighten",
      description: "Define measurement units"
    },
  },

  // USER MANAGEMENT SECTION
  {
    type: "title",
    title: "User Management",
    key: "user-section",
  },
  {
    type: "collapse",
    name: "User Management",
    key: "user-management",
    icon: "people",
    route: "/user-management",
    path: "user-management",
    element: <UserManagement />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.userManagement", 
      icon: "people",
      description: "Manage system users"
    },
  },

  // ANALYTICS SECTION
  {
    type: "title",
    title: "Analytics",
    key: "analytics-section",
  },
  {
    type: "collapse",
    name: "Reports & Analytics",
    key: "reports",
    icon: "analytics",
    route: "/reports",
    path: "reports",
    element: <Reports />,
    allowedRoles: ["admin"],
    meta: { 
      titleKey: "nav.reports", 
      icon: "analytics",
      description: "View reports and analytics"
    },
  },

  // Global notifications route with smart layout detection
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: "notifications",
    route: "/notifications",
    path: "notifications",
    element: <NotificationPageWrapper />,
    allowedRoles: ["admin", "user"],
    meta: { 
      titleKey: "nav.notifications", 
      icon: "notifications",
      description: "System notifications"
    },
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;