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

  // ADMIN
  {
    type: "collapse",
    name: "Admin Dashboard",
    key: "admin",
    icon: "dashboard",
    route: "/admin",
    path: "admin",
    element: <AdminDashboard />,
    allowedRoles: ["admin"],
    meta: { titleKey: "nav.adminDashboard", icon: "dashboard" },
  },
  {
    type: "collapse",
    name: "Order Management",
    key: "order-management",
    icon: "assignment",
    route: "/order-management",
    path: "order-management",
    element: <OrderManagement />,
    allowedRoles: ["admin"],
    meta: { titleKey: "nav.orderManagement", icon: "assignment" },
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
    meta: { titleKey: "nav.categoryManagement", icon: "category" },
  },
  {
    type: "collapse",
    name: "Product Management",
    key: "product-management",
    icon: "shopping_bag",
    route: "/product-management",
    path: "product-management",
    element: <ProductManagement />,
    allowedRoles: ["admin"],
    meta: { titleKey: "nav.productManagement", icon: "shopping_bag" },
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
    meta: { titleKey: "nav.unitManagement", icon: "straighten" },
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
    meta: { titleKey: "nav.userManagement", icon: "people" },
  },
  {
    type: "collapse",
    name: "Reports",
    key: "reports",
    icon: "bar_chart",
    route: "/reports",
    path: "reports",
    element: <Reports />,
    allowedRoles: ["admin"],
    meta: { titleKey: "nav.reports", icon: "bar_chart" },
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
