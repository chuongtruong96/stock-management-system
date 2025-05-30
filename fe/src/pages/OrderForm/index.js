import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import { toast } from "react-toastify";

import { orderApi, userApi, orderWindowApi } from "services/api"; // Updated import

import { WsContext } from "context/WsContext";
import { buildTable } from "./tableData";
import OrderProgress from "components/OrderProgress";
import UploadSignedDialog from "components/UploadSignedDialog";

export default function OrderForm({ language = "en" }) {
  const [rows, setRows] = useState([]);
  const [table, setTable] = useState({ columns: [], rows: [] });
  const [user, setUser] = useState(null);
  const [dept, setDept] = useState("–");
  const [canOrder, setCanOrder] = useState(true);
  const [order, setOrder] = useState(null);
  const [upOpen, setUpOpen] = useState(false);

  const { subscribe } = useContext(WsContext);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const userResponse = await userApi.getUserInfo(); // Updated to userApi.getUserInfo
        setUser(userResponse);
        setDept(userResponse.departmentName);
      } catch {
        toast.error("User info error");
      }

      setRows(JSON.parse(localStorage.getItem("orderItems") || "[]"));

      const windowResponse = await orderWindowApi.check(); // Updated to orderWindowApi.check
      setCanOrder(windowResponse.canOrder);
    })();
  }, []);

  useEffect(() => {
    if (rows) setTable(buildTable(rows, language, handleQty, handleRemove));
  }, [rows, language]);

  useEffect(() => {
    let off;
    subscribe("/topic/order-window", ({ open }) => {
      setCanOrder(open);
      toast.info(open ? "✅ Window OPEN" : "⏰ Window CLOSED");
    }).then((o) => (off = o));
    return () => off && off();
  }, [subscribe]);

  const handleQty = (id, q) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, quantity: q } : r)));
  const handleRemove = (id) => setRows((rs) => rs.filter((r) => r.id !== id));

  const handleSubmit = async () => {
    if (!canOrder) {
      toast.warning(
        language === "vi" ? "Cửa sổ đóng" : "Ordering window closed"
      );
      return;
    }
    try {
      const response = await orderApi.create({
        items: rows.map((r) => ({ productId: r.id, quantity: r.quantity })),
      }); // Updated to orderApi.create
      setOrder(response);
      toast.success("Order created – export PDF to get it signed");
      localStorage.removeItem("orderItems");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const handleExport = async () => {
    try {
      const response = await orderApi.export(order.orderId); // Updated to orderApi.export
      window.open(`/api/orders/${order.orderId}/signed-file`, "_blank");
      setOrder(response);
      toast.success("PDF exported – please get signature");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const today = new Date().toLocaleDateString();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDTypography variant="h4" mb={1}>
          {language === "vi" ? "Đơn đặt hàng" : "Order form"}
        </MDTypography>
        <MDTypography>
          {language === "vi" ? "Phòng ban" : "Department"}: {dept}
        </MDTypography>
        <MDTypography>
          {language === "vi" ? "Người dùng" : "User"}: {user?.username || "…"}
        </MDTypography>
        <MDTypography>
          {language === "vi" ? "Ngày" : "Date"}: {today}
        </MDTypography>
        {!canOrder && (
          <MDTypography color="error" fontWeight="bold" mt={1}>
            {language === "vi"
              ? "(Cửa sổ đặt hàng đang đóng)"
              : "(Ordering window closed)"}
          </MDTypography>
        )}
        {order && (
          <MDBox mt={3}>
            <OrderProgress status={order.status} />
          </MDBox>
        )}
        <MDBox mt={3}>
          <DataTable
            table={table}
            canSearch={false}
            entriesPerPage={false}
            showTotalEntries={false}
            noEndBorder
          />
        </MDBox>
        <MDBox mt={2} display="flex" flexWrap="wrap" gap={2}>
          <MDButton
            variant="gradient"
            color="info"
            size="large"
            disabled={!rows.length || order}
            onClick={handleSubmit}
          >
            {language === "vi" ? "Tạo đơn" : "Create order"}
          </MDButton>
          {order && order.status === "pending" && (
            <MDButton variant="outlined" color="info" onClick={handleExport}>
              {language === "vi" ? "Xuất PDF" : "Export PDF"}
            </MDButton>
          )}
          {order && order.status === "exported" && (
            <MDButton
              variant="outlined"
              color="info"
              onClick={() => setUpOpen(true)}
            >
              {language === "vi" ? "Tải PDF đã ký" : "Upload signed PDF"}
            </MDButton>
          )}
          {order && order.status === "submitted" && (
            <MDButton variant="gradient" color="success" disabled>
              {language === "vi" ? "Đang chờ admin" : "Waiting for admin…"}
            </MDButton>
          )}
        </MDBox>
      </MDBox>
      {order && (
        <UploadSignedDialog
          open={upOpen}
          order={order}
          onClose={() => setUpOpen(false)}
          onDone={() => setOrder((prev) => ({ ...prev, status: "submitted" }))}
        />
      )}
      <Footer />
    </DashboardLayout>
  );
}