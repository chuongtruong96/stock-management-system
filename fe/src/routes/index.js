import { Navigate } from "react-router-dom";
import { authRoutes } from "./authRoutes";
import { adminRoutes } from "./adminRoutes";
import { userRoutes } from "./userRoutes";
import RoleRedirect from "./RoleRedirect";

/**
 * Main routes configuration
 * Combines all route modules and provides fallback handling
 */
const routes = [
  // Root redirect - determines where users go based on their role
  {
    path: "/",
    element: <RoleRedirect />,
  },
  
  // Authentication routes (sign-in, sign-up, etc.)
  ...authRoutes,
  
  // Admin dashboard routes
  ...adminRoutes,
  
  // User interface routes
  ...userRoutes,
  
  // Fallback for unmatched routes
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;