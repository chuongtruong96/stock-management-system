import { useLocation } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/template/MDBox";
import { usePageTitle } from "hooks/usePageTitle";
import { useTranslation } from "react-i18next";

export default function DashboardShellClean({ children, titleKey, icon = "home", hideBreadcrumbs = false }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const title = t(titleKey);
  const route = pathname.split("/").filter(Boolean);

  usePageTitle(title);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox px={2} py={3}>
        {/* Conditionally render breadcrumbs - hidden for admin pages */}
        {!hideBreadcrumbs && (
          <MDBox mb={3}>
            {/* Breadcrumbs would go here, but we're hiding them for admin */}
          </MDBox>
        )}
        <MDBox>
          {children}
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}