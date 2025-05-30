import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import { toast } from "react-toastify";
import Card from "@mui/material/Card";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { unitApi } from "services/api"; // Updated import
import { buildTable } from "./tableData";

export default function UnitManagement({ language = "en" }) {
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ id: null, nameEn: "", nameVn: "" });

  useEffect(() => {
    (async () => {
      try {
        const response = await unitApi.getAll(); // Updated to unitApi.getAll
        setUnits(response); // Response already unwrapped in api.js
      } catch (e) {
        toast.error("Load units failed");
      }
    })();
  }, []);

  const resetDraft = () => setDraft({ id: null, nameEn: "", nameVn: "" });

  const handleSave = async () => {
    try {
      if (!draft.nameEn.trim() || !draft.nameVn.trim()) {
        toast.warn(language === "vi" ? "Điền đủ 2 tên!" : "Both names required");
        return;
      }
      if (draft.id) {
        const response = await unitApi.update(draft.id, draft); // Updated to unitApi.update
        setUnits((u) => u.map((x) => (x.id === response.id ? response : x)));
        toast.success(language === "vi" ? "Đã cập nhật!" : "Updated!");
      } else {
        const response = await unitApi.add(draft); // Updated to unitApi.add
        setUnits((u) => [...u, response]);
        toast.success(language === "vi" ? "Đã thêm!" : "Added!");
      }
      setOpen(false);
      resetDraft();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm(language === "vi" ? "Xác nhận xóa?" : "Delete confirm?"))
      return;
    try {
      await unitApi.delete(id); // Updated to unitApi.delete
      setUnits((u) => u.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const { table } = useMemo(() => {
    const rows = units.map((u) => ({
      ...u,
      action: (
        <>
          <IconButton
            size="small"
            color="info"
            onClick={() => {
              setDraft(u);
              setOpen(true);
            }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => remove(u.id)}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </>
      ),
    }));
    return { table: buildTable(rows, language) };
  }, [units, language]);

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
              {language === "vi" ? "Quản lý đơn vị" : "Unit Management"}
            </MDBox>
            <MDButton
              variant="gradient"
              color="light"
              size="small"
              sx={{ ml: "auto", color: "black" }}
              onClick={() => {
                resetDraft();
                setOpen(true);
              }}
            >
              {language === "vi" ? "Thêm đơn vị" : "Add Unit"}
            </MDButton>
          </MDBox>
          <MDBox pt={3} px={2}>
            <DataTable
              table={table}
              isSorted={true}
              canSearch
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
              showTotalEntries={true}
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetDraft();
        }}
      >
        <DialogTitle>
          {draft.id
            ? language === "vi"
              ? "Sửa đơn vị"
              : "Edit Unit"
            : language === "vi"
            ? "Thêm đơn vị"
            : "Add Unit"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            autoFocus
            margin="normal"
            label={language === "vi" ? "Tên (EN)" : "Name (EN)"}
            value={draft.nameEn}
            onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label={language === "vi" ? "Tên (VI)" : "Name (VI)"}
            value={draft.nameVn}
            onChange={(e) => setDraft({ ...draft, nameVn: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="secondary"
            onClick={() => {
              setOpen(false);
              resetDraft();
            }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </MDButton>
          <MDButton color="info" variant="gradient" onClick={handleSave}>
            {draft.id
              ? language === "vi"
                ? "Cập nhật"
                : "Update"
              : language === "vi"
              ? "Thêm"
              : "Add"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}