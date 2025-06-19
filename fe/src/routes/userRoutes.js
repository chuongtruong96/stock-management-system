import { lazy } from "react";
import {
  Home as HomeIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrderIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Person as ProfileIcon,
  Dashboard as DashboardIcon,
  Receipt as OrderDetailIcon,
} from "@mui/icons-material";

// Lazy load components for better performance
const UserLayout = lazy(() => import("layouts/user/UserLayout"));
const HomePage = lazy(() => import("pages/User/Home/HomePage"));
const ProductsPage = lazy(() => import("pages/User/Products/ProductsPage"));
const ProductDetail = lazy(() => import("pages/User/Products/ProductDetail"));
const OrderForm = lazy(() => import("pages/User/OrderForm/OrderForm"));
const OrderDetail = lazy(() => import("pages/User/Orders/OrderDetail"));
const OrderHistory = lazy(() => import("pages/User/Orders/OrderHistory"));
const NotificationsPage = lazy(() => import("pages/User/Notifications/Notifications"));
const ProfilePage = lazy(() => import("pages/User/Profile/Profile"));

/**
 * User routes configuration
 * All routes are nested under UserLayout and require 'user' role
 */
export const userRoutes = [
  {
    key: "user-layout",
    path: "",
    element: <UserLayout />,
    allowedRoles: ["user"],
    meta: {
      titleKey: "nav.dashboard",
      icon: <DashboardIcon />,
    },
    children: [
      // Home/Dashboard routes
      {
        index: true,
        element: <HomePage />,
        key: "home-index",
        meta: {
          titleKey: "nav.dashboard",
          icon: <HomeIcon />,
        },
      },
      {
        path: "dashboard",
        element: <HomePage />,
        key: "dashboard",
        meta: {
          titleKey: "nav.dashboard",
          icon: <DashboardIcon />,
        },
      },
      
      // Product routes
      {
        path: "products",
        element: <ProductsPage />,
        key: "products",
        meta: {
          titleKey: "nav.products",
          icon: <ProductsIcon />,
        },
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
        key: "product-detail",
        meta: {
          titleKey: "nav.productDetail",
          icon: <ProductsIcon />,
        },
      },
      
      // Order routes
      {
        path: "order-form",
        element: <OrderForm />,
        key: "order-form",
        meta: {
          titleKey: "nav.orderForm",
          icon: <OrderIcon />,
        },
      },
      {
        path: "order-history",
        element: <OrderHistory />,
        key: "order-history",
        meta: {
          titleKey: "nav.orderHistory",
          icon: <HistoryIcon />,
        },
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
        key: "order-detail",
        meta: {
          titleKey: "nav.orderDetail",
          icon: <OrderDetailIcon />,
        },
      },
      
      // User account routes
      {
        path: "notifications",
        element: <NotificationsPage />,
        key: "notifications",
        meta: {
          titleKey: "nav.notifications",
          icon: <NotificationsIcon />,
        },
      },
      {
        path: "profile",
        element: <ProfilePage />,
        key: "profile",
        meta: {
          titleKey: "nav.profile",
          icon: <ProfileIcon />,
        },
      },
    ],
  },
];