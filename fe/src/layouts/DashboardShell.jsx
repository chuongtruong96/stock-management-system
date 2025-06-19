import { useLocation } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Breadcrumbs from "examples/Breadcrumbs";
import MDBox from "components/template/MDBox";
import { usePageTitle } from "hooks/usePageTitle";
import { useTranslation } from "react-i18next";

export default function DashboardShell({ children, titleKey, icon = "home" }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const title = t(titleKey);
  const route = pathname.split("/").filter(Boolean);

  usePageTitle(title);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox px={2} py={3}>
        <Breadcrumbs icon={icon} title={title} route={route} />
        <MDBox mt={3}>{children}</MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
