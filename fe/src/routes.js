/*  src/routes.js  */
import { Navigate } from "react-router-dom";
import Icon         from "@mui/material/Icon";

/* ---------- AUTH ---------- */
import SignInBasic  from "layouts/authentication/sign-in";
import SignUpCover  from "layouts/authentication/sign-up";
import ResetPwCover from "layouts/authentication/reset-password/cover";

/* ---------- USER LAYOUT & PAGES ---------- */
import UserLayout   from "layouts/user/UserLayout";
import HomePage     from "pages/User/Home/HomePage";

/* ——  catalogue —— */
import ProductsPage   from "pages/User/Products/ProductsPage";          // ⭐ NEW list + filter + grid
import ProductDetail  from "pages/User/Products/ProductDetail";

/* ——  others —— */
import OrderForm     from "pages/OrderForm";
import OrderHistory  from "pages/OrderHistory";
import Profile       from "layouts/profile";
import Notifications from "pages/Notifications";

/* ---------- ADMIN ---------- */
import AdminDashboard     from "pages/Admin/AdminDashboard";
import OrderManagement    from "pages/OrderManagement";
import ProductManagement  from "pages/ProductManagement";
import UnitManagement     from "pages/UnitManagement";
import UserManagement     from "pages/UserManagement";
import Reports            from "pages/Reports";
import SummaryDashboard   from "pages/SummaryDashboard";
import CategoryManagement from "pages/CategoryManagement";
/* helpers */
import RoleRedirect  from "components/RoleRedirect";

/* ----------------------------------------------------------------- */
const routes = [
  /* ---------- root ---------- */
  { path: "/", element: <RoleRedirect /> },

  /* ---------- AUTH ---------- */
  { key: "signin",  path: "auth/sign-in",        element: <SignInBasic /> },
  { key: "signup",  path: "auth/sign-up",        element: <SignUpCover /> },
  { key: "resetpw", path: "auth/reset-password", element: <ResetPwCover /> },

  /* ---------- USER ---------- */
  {
    key: "user",
    element: <UserLayout />,
    allowedRoles: ["user"],
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },

      /* dashboard / home */
      { path: "dashboard", key: "dash", element: <HomePage /> },

      /* catalogue (list)  – query string giữ categoryId, page, sort, q… */
      { path: "products",      key: "prodList",  element: <ProductsPage /> },

      /* product detail */
      { path: "products/:id",  key: "prodDet",   element: <ProductDetail /> },

      /* order & misc. */
      { path: "order-form",    element: <OrderForm />     },
      { path: "order-history", element: <OrderHistory />  },
      { path: "profile",       element: <Profile />       },
      { path: "notifications", element: <Notifications /> },
    ],
  },

  /* ---------- ADMIN ---------- */
  { path: "admin",              element: <AdminDashboard />,      allowedRoles: ["admin"] },
  { path: "order-management",   element: <OrderManagement />,     allowedRoles: ["admin"] },
  { path: "category-management",element: <CategoryManagement />,  allowedRoles: ["admin"] },
  { path: "product-management", element: <ProductManagement />,   allowedRoles: ["admin"] },
  { path: "unit-management",    element: <UnitManagement />,      allowedRoles: ["admin"] },
  { path: "user-management",    element: <UserManagement />,      allowedRoles: ["admin"] },
  { path: "reports",            element: <Reports />,             allowedRoles: ["admin"] },
  { path: "summaries",          element: <SummaryDashboard />,    allowedRoles: ["admin"] },

  /* ---------- 404 ---------- */
  { path: "*", element: <Navigate to="/" replace /> },
];

export default routes;
