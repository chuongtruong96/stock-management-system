import { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { toast } from "react-toastify";
import DataTable from "examples/Tables/DataTable"; // Added import

import { userApi, orderApi } from "services/api";

import { buildOrdersTable, buildItemsTable } from "./tableData";
import OrderProgress from "components/OrderProgress";

export default function OrderHistory({ language = "en" }) {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [ordersTbl, setOrdersTbl] = useState({ columns: [], rows: [] });
  const [itemsTbl, setItemsTbl] = useState({ columns: [], rows: [] });

  useEffect(() => {
    (async () => {
      try {
        const userResponse = await userApi.getUserInfo();
        const deptId = userResponse.departmentId ?? userResponse.department?.departmentId;
        if (!deptId) {
          toast.error("No department!");
          return;
        }
        const ordersResponse = await orderApi.getByDepartment(deptId);
        setOrders(ordersResponse);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, [language]);

  useEffect(() => {
    setOrdersTbl(buildOrdersTable(orders, language, handleView));
  }, [orders, language]); // eslint-disable-line

  async function handleView(id) {
    try {
      const response = await orderApi.getItems(id);
      setItems(response);
      setOpenId(id);
      setItemsTbl(buildItemsTable(response, language));
    } catch (e) {
      toast.error(e.message);
    }
  }

  const selOrder = orders.find((o) => o.orderId === openId);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDTypography variant="h4" mb={2}>
          {language === "vi" ? "Lịch sử đơn hàng" : "Order history"}
        </MDTypography>
        <DataTable
          table={ordersTbl}
          entriesPerPage={false}
          canSearch
          showTotalEntries={false}
          noEndBorder
        />
      </MDBox>
      <Dialog
        open={Boolean(openId)}
        onClose={() => setOpenId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {language === "vi" ? "Đơn #" : "Order #"}
          {openId}
        </DialogTitle>
        <DialogContent dividers>
          {selOrder && (
            <>
              <OrderProgress status={selOrder.status} />
              <MDTypography>
                Status: <strong>{selOrder.status}</strong>
              </MDTypography>
              <MDTypography>
                {language === "vi" ? "Ngày tạo" : "Created"}:{" "}
                {new Date(selOrder.createdAt).toLocaleString()}
              </MDTypography>
              {selOrder.adminComment && (
                <MDTypography>
                  {language === "vi" ? "Ghi chú" : "Comment"}: {selOrder.adminComment}
                </MDTypography>
              )}
              <MDBox mt={3}>
                <DataTable
                  table={itemsTbl}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  canSearch={false}
                  noEndBorder
                />
              </MDBox>
              <MDBox textAlign="right" mt={2}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => setOpenId(null)}
                >
                  {language === "vi" ? "Đóng" : "Close"}
                </MDButton>
              </MDBox>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}