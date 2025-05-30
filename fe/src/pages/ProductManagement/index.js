import { useState, useEffect, useContext } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import { toast } from "react-toastify";

import { WsContext } from "context/WsContext";
import { productApi, unitApi } from "services/api"; // Updated import

import { buildTable } from "./tableData";
import ProductDialog from "./ProductDialog";

export default function ProductManagement({ language = "en" }) {
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [table, setTable] = useState(
    buildTable(
      [],
      language,
      () => {},
      () => {}
    )
  );

  const [dlgOpen, setDlgOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [stkOpen, setStkOpen] = useState(false);
  const [stkRow, setStkRow] = useState(null);

  const { subscribe } = useContext(WsContext);

  useEffect(() => {
    (async () => {
      const [p, u] = await Promise.all([productApi.getAll(), unitApi.getAll()]); // Updated to productApi.getAll and unitApi.getAll
      setRows(p);
      setUnits(u);
    })();
  }, []);

  useEffect(() => {
    setTable(buildTable(rows, language, openEdit, handleDelete));
  }, [rows, language]); // eslint-disable-line

  const openAdd = () => {
    setEditRow(null);
    setDlgOpen(true);
  };
  const openEdit = (r) => {
    setEditRow(r);
    setDlgOpen(true);
  };

  const saveProduct = async (draft) => {
    try {
      if (editRow) {
        const response = await productApi.update(editRow.id, draft); // Updated to productApi.update
        setRows((p) => p.map((r) => (r.id === response.id ? response : r)));
      } else {
        const response = await productApi.add(draft); // Updated to productApi.add
        setRows((p) => [...p, response]);
      }
      setDlgOpen(false);
    } catch (e) {
      toast.error("Save error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === "vi" ? "Xác nhận xóa?" : "Confirm delete?"))
      return;
    try {
      await productApi.delete(id); // Updated to productApi.delete
      setRows((p) => p.filter((r) => r.id !== id));
    } catch {
      toast.error("Delete error");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox
            mx={2}
            mt={-3}
            py={2}
            px={2}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            display="flex"
            alignItems="center"
          >
            <MDBox component="h6" color="white">
              {language === "vi" ? "Quản lý sản phẩm" : "Product management"}
            </MDBox>
            <MDButton
              variant="gradient"
              color="light"
              size="small"
              sx={{ ml: "auto", color: "primary" }}
              onClick={openAdd}
            >
              {language === "vi" ? "Thêm" : "Add"}
            </MDButton>
          </MDBox>
          <MDBox pt={3}>
            <DataTable
              table={table}
              canSearch
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
      <ProductDialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        onSave={saveProduct}
        lang={language}
        product={editRow}
        units={units}
      />
    </DashboardLayout>
  );
}