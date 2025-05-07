/*  src/routes.js  */
import React from "react";
import Icon from "@mui/material/Icon";
import { Navigate } from "react-router-dom";

/* AUTH layouts */
import SignInBasic from "layouts/authentication/sign-in";
import SignUpCover from "layouts/authentication/sign-up";
import ResetPwCover from "layouts/authentication/reset-password/cover";

/* App pages */
import AdminDashboard from "pages/Admin/AdminDashboard";
import UserDashboard from "pages/User/UserDashboard";
import ProductList from "pages/ProductList";
import OrderForm from "pages/OrderForm";
import OrderHistory from "pages/OrderHistory";
import OrderManagement from "pages/OrderManagement";
import ProductManagement from "pages/ProductManagement";
import UnitManagement from "pages/UnitManagement";
import UserManagement from "pages/UserManagement";
import Reports from "pages/Reports";
import NotificationsPage from "pages/NotificationsPage";
import SummaryDashboard from "pages/SummaryDashboard";
import Profile from "layouts/profile";

/* Helpers */
import RoleRedirect from "components/RoleRedirect";
import ProtectedRoute from "components/ProtectedRoute";

/* ------------------------------------------------------------------ */
const routes = [
  /* ---------- ROOT (tự điều hướng) ---------- */
  {
    type: "route",
    key: "root",
    route: "/",
    component: <RoleRedirect />,
  },

  /* ---------- AUTH ---------- */
  {
    type: "route",
    key: "signin",
    route: "/auth/sign-in",
    component: <SignInBasic />,
  },
  {
    type: "route",
    key: "signup",
    route: "/auth/sign-up",
    component: <SignUpCover />,
  },
  {
    type: "route",
    key: "resetpw",
    route: "/auth/reset-password",
    component: <ResetPwCover />,
  },

  /* ---------- USER ---------- */
  {
    type: "collapse",
    key: "dashboard-user",
    name: "Dashboard",
    route: "/dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    component: <UserDashboard />,
    allowedRoles: ["user"],
  },

  {
    type: "collapse",
    key: "products",
    name: "Products",
    route: "/products",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    component: <ProductList />,
    allowedRoles: ["user"],
  },

  {
    type: "collapse",
    key: "order-form",
    name: "Order Form",
    route: "/order-form",
    icon: <Icon fontSize="small">add_shopping_cart</Icon>,
    component: <OrderForm />,
    allowedRoles: ["user"],
  },

  {
    type: "collapse",
    key: "order-history",
    name: "Order History",
    route: "/order-history",
    icon: <Icon fontSize="small">history</Icon>,
    component: <OrderHistory />,
    allowedRoles: ["user"],
  },

  /* ---------- COMMON ---------- */
  {
    type: "collapse",
    key: "profile",
    name: "Profile",
    route: "/profile",
    icon: <Icon fontSize="small">person</Icon>,
    component: <Profile />,
    allowedRoles: ["admin", "user"],
  },

  {
    type: "collapse",
    key: "notifications",
    name: "Notifications",
    route: "/notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    component: <NotificationsPage />,
    allowedRoles: ["admin", "user"],
  },

  /* ---------- ADMIN ---------- */
  {
    type: "collapse",
    key: "dashboard-admin",
    name: "Admin",
    route: "/admin",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    component: <AdminDashboard />,
    allowedRoles: ["admin"],
  },

  {
    type: "collapse",
    key: "order-management",
    name: "Order Management",
    route: "/order-management",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    component: <OrderManagement />,
    allowedRoles: ["admin"],
  },

  {
    type: "collapse",
    key: "product-management",
    name: "Product Management",
    route: "/product-management",
    icon: <Icon fontSize="small">inventory</Icon>,
    component: <ProductManagement />,
    allowedRoles: ["admin"],
  },

  {
    type: "collapse",
    key: "unit-management",
    name: "Unit Management",
    route: "/unit-management",
    icon: <Icon fontSize="small">settings</Icon>,
    component: <UnitManagement />,
    allowedRoles: ["admin"],
  },

  {
    type: "collapse",
    key: "user-management",
    name: "User Management",
    route: "/user-management",
    icon: <Icon fontSize="small">people</Icon>,
    component: <UserManagement />,
    allowedRoles: ["admin"],
  },

  {
    type: "collapse",
    key: "reports",
    name: "Reports",
    route: "/reports",
    icon: <Icon fontSize="small">bar_chart</Icon>,
    component: <Reports />,
    allowedRoles: ["admin"],
  },

  {
    type: "collapse",
    key: "summaries",
    name: "Summaries",
    route: "/summaries",
    icon: <Icon fontSize="small">assessment</Icon>,
    component: <SummaryDashboard />,
    allowedRoles: ["admin"],
  },

  /* ---------- 404 ---------- */
  {
    type: "route",
    key: "notfound",
    route: "*",
    component: <Navigate to="/" />,
  },
];

export default routes;
