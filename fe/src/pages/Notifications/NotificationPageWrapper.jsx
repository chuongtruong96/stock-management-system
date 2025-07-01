import React, { useContext } from "react";
import { AuthContext } from "context/AuthContext";
import AdminLayout from "layouts/AdminLayout";
import NotificationsPage from "pages/User/Notifications/Notifications";

/**
 * Smart wrapper component that detects user role and renders appropriate layout
 * - Admin users: Wrapped with AdminLayout (prevents sidebar overlay)
 * - Regular users: Direct component (uses Container for user-style layout)
 */
export default function NotificationPageWrapper() {
  const { auth } = useContext(AuthContext);
  
  // Check if user has admin role
  const isAdmin = auth?.user?.roles?.some(role => 
    role.toLowerCase() === "admin" || role.toLowerCase() === "role_admin"
  );

  // Render with appropriate layout based on user role
  if (isAdmin) {
    return (
      <AdminLayout titleKey="notifications" icon="notifications">
        <NotificationsPage />
      </AdminLayout>
    );
  }

  // For regular users, render the component directly (it uses Container internally)
  return <NotificationsPage />;
}