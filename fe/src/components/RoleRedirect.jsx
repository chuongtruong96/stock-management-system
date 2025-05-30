import { useContext, useEffect } from "react";
import { useNavigate }           from "react-router-dom";
import { AuthContext }           from "context/AuthContext";

/**
 * Chuyển hướng người dùng tới dashboard phù hợp:
 *   /admin      – khi có role ADMIN
 *   /dashboard  – khi có role USER
 *   /auth/sign-in – khi chưa đăng nhập
 *
 * Không render gì hết – chỉ thực hiện navigate trong useEffect.
 */
export default function RoleRedirect() {
  const { auth } = useContext(AuthContext);
  const nav      = useNavigate();

  /* Hook PHẢI luôn được gọi – không return sớm */
  useEffect(() => {
    if (!auth) return;                       // chờ AuthProvider khởi tạo

    if (!auth.token)
      return nav("/auth/sign-in", { replace:true });

    const roles = (auth.user?.roles || []).map(r => r.toLowerCase());
    if (roles.includes("admin"))
      return nav("/admin", { replace:true });

    if (roles.includes("user"))
      return nav("/dashboard", { replace:true });

    // token hợp lệ nhưng role lạ
    nav("/auth/sign-in", { replace:true });
  }, [auth, nav]);

  /* Không render UI nào cả */
  return null;
}
