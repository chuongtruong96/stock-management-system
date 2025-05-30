import { useEffect, useState, useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { userApi } from "services/api"; // Updated import
import { toast } from "react-toastify";
import { AuthContext } from "context/AuthContext";

export default function Profile() {
  const { auth } = useContext(AuthContext);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.token) return;

    userApi.getUserInfo() // Updated to userApi.getUserInfo
      .then((response) => setInfo(response))
      .catch(() => toast.error("Cannot load profile"))
      .finally(() => setLoading(false));
  }, [auth]);

  if (loading)
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox height="60vh" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size={48} />
        </MDBox>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={2} px={2}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8} lg={6}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h5" fontWeight="medium" gutterBottom>
                <Icon sx={{ verticalAlign: "middle", mr: 1 }}>account_circle</Icon>
                Personal information
              </MDTypography>
              <Divider sx={{ my: 2 }} />
              <MDBox lineHeight={2}>
                <InfoRow label="Username" value={info.username} />
                <InfoRow label="Role" value={info.role} />
                <InfoRow label="Department" value={info.departmentName} />
                <InfoRow label="Dept. email" value={info.departmentEmail} />
                <InfoRow label="Dept. id" value={info.departmentId} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

function InfoRow({ label, value }) {
  return (
    <MDBox display="flex" py={0.5}>
      <MDTypography variant="button" fontWeight="bold" width="40%">
        {label}
      </MDTypography>
      <MDTypography variant="button" color="text">
        {value ?? "—"}
      </MDTypography>
    </MDBox>
  );
}