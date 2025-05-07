// src/layouts/DashboardShell.jsx
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer          from "examples/Footer";
import MDBox           from "components/MDBox";
import MDTypography    from "components/MDTypography";

/**
 * Wrapper chia sẻ Navbar/Footer – tránh lặp code
 */
export default function DashboardShell({ title, children }) {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        {title && (
          <MDTypography variant="h4" mb={3}>
            {title}
          </MDTypography>
        )}
        {children}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
