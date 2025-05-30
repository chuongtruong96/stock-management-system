import { useEffect, useState } from "react";
import DashboardLayout   from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar   from "examples/Navbars/DashboardNavbar";
import Footer            from "examples/Footer";
import MDBox             from "components/MDBox";
import MDTypography      from "components/MDTypography";
import MDButton          from "components/MDButton";
import DataTable         from "examples/Tables/DataTable";

import { useNotifications }  from "context/NotificationContext";
import { buildTable }        from "./tableData";

export default function NotificationsPage() {
  const { items, markAsRead, markAll } = useNotifications();

  /* ---------- DataTable state ---------- */
  const [table, setTable] = useState({ columns:[], rows:[] });

  useEffect(()=>{
    setTable(buildTable(items, markAsRead));
  },[items, markAsRead]);

  /* ---------- render ---------- */
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h4">
            Notifications
          </MDTypography>

          <MDButton
            size="small"
            color="info"
            variant="gradient"
            disabled={!items.some(n=>!n.read)}
            onClick={markAll}
          >
            Mark all as read
          </MDButton>
        </MDBox>

        <DataTable
          table={table}
          canSearch
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />

        {items.length===0 && (
          <MDBox textAlign="center" py={6}>
            <MDTypography variant="button" color="text">
              No notifications
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
