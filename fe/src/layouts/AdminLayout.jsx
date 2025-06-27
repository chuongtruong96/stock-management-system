import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useMaterialUIController, setLayout } from "context";

// Material Dashboard 2 React components
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/template/MDBox";

// Hooks
import { usePageTitle } from "hooks/usePageTitle";
import { useTranslation } from "react-i18next";

function AdminLayout({ children, titleKey, icon = "dashboard" }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();
  const { t } = useTranslation();
  
  const title = titleKey ? t(titleKey) : t("adminDashboard");

  usePageTitle(title);

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [dispatch]);

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 1,
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "background.default",

        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      {/* Navbar - breadcrumbs are handled inside DashboardNavbar */}
      <DashboardNavbar />
      
      {/* Main Content */}
      <MDBox px={1} py={2}>
        <MDBox mt={2}>
          {children}
        </MDBox>
      </MDBox>
      
      {/* Footer */}
      <Footer />
    </MDBox>
  );
}

export default AdminLayout;