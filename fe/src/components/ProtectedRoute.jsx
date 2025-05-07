import { useContext } from "react";
import { Navigate }   from "react-router-dom";
import { AuthContext } from "context/AuthContext";

/**
 * Bọc quanh route cần quyền.
 *  - Nếu chưa đăng nhập  → /auth/sign-in
 *  - Nếu không đủ quyền  → /          (để RoleRedirect xử lý tiếp)
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { auth } = useContext(AuthContext);
  if (auth === undefined) return null;
  /* Chưa login */
  if (!auth?.token) return <Navigate to="/auth/sign-in" replace />;

  /* Không giới hạn quyền */
  if (!allowedRoles.length) return children;

  /* Lấy & chuẩn‑hóa mảng roles: role_user → user */
  const roles = (auth.user?.roles || []).map(r =>
    r.toLowerCase().replace(/^role_/, "")
  );

  const ok = allowedRoles.some(ar => roles.includes(ar.toLowerCase()));
  return ok ? children : <Navigate to="/" replace />;
}
