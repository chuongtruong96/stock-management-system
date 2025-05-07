import { useContext } from "react";
import { Navigate }   from "react-router-dom";
import { AuthContext } from "context/AuthContext";

/**
 * Đưa người dùng tới dashboard đúng vai trò.
 * (Không cần bọc ProtectedRoute bên ngoài.)
 */
export default function RoleRedirect() {
  const { auth } = useContext(AuthContext);
  if (auth === undefined) return null;

  if (!auth?.token) return <Navigate to="/auth/sign-in" replace />;

  const roles = (auth.user?.roles || []).map(r =>
    r.toLowerCase().replace(/^role_/, "")
  );

  if (roles.includes("admin")) return <Navigate to="/admin" replace />;
  if (roles.includes("user"))  return <Navigate to="/dashboard" replace />;

  /* token hợp lệ nhưng không có role phù hợp → về sign‑in */
  return <Navigate to="/auth/sign-in" replace />;
}
