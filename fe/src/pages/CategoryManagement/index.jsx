import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  Stack,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/UploadFile";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { toast } from "react-toastify";

import { categoryApi } from "services/api"; // Updated import

export default function CategoryManagement({ language = "en" }) {
  const [rows, setRows] = useState([]);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [draft, setDraft] = useState({ categoryId: null, name: "", icon: "" });
  const [iconFile, setIconFile] = useState(null);

  const fetchRows = useCallback(async () => {
    const response = await categoryApi.getAll(); // Updated to categoryApi.getAll
    setRows(response);
  }, []);
  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const reset = () => {
    setDraft({ categoryId: null, name: "", icon: "" });
    setIconFile(null);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      toast.warn(language === "vi" ? "Nhập tên" : "Name required");
      return;
    }
    try {
      let saved;
      if (draft.categoryId) {
        saved = await categoryApi.update(draft.categoryId, { name: draft.name }); // Updated to categoryApi.update
      } else {
        saved = await categoryApi.create({ name: draft.name }); // Updated to categoryApi.create
      }

      if (iconFile) {
        const fd = new FormData();
        fd.append("file", iconFile);
        const tId = toast.loading("Uploading icon…");
        const catWithIcon = await categoryApi.uploadIcon(saved.categoryId, fd); // Updated to categoryApi.uploadIcon
        toast.update(tId, {
          render: "Done",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        saved = catWithIcon;
      }

      setRows((prev) => {
        const exist = prev.find((x) => x.categoryId === saved.categoryId);
        return exist
          ? prev.map((x) => (x.categoryId === saved.categoryId ? saved : x))
          : [...prev, saved];
      });
      toast.success(draft.categoryId ? "Updated!" : "Added!");
      setDlgOpen(false);
      reset();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await categoryApi.delete(id); // Updated to categoryApi.delete
      setRows((r) => r.filter((x) => x.categoryId !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    {
      field: "icon",
      headerName: " ",
      width: 70,
      renderCell: ({ row }) => <Avatar src={`/assets/icons/${row.icon}`} />,
    },
    { field: "name", headerName: language === "vi" ? "Tên" : "Name", flex: 1 },
    {
      field: "action",
      headerName: language === "vi" ? "Thao tác" : "Actions",
      width: 120,
      renderCell: ({ row }) => (
        <>
          <IconButton
            color="info"
            size="small"
            onClick={() => {
              setDraft(row);
              setDlgOpen(true);
            }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => remove(row.categoryId)}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box pt={6} pb={3} px={2}>
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{ typography: "h5", fontWeight: "bold" }}
        >
          {language === "vi" ? "Quản lý danh mục" : "Category Management"}
          <Button
            sx={{ ml: "auto" }}
            variant="contained"
            onClick={() => {
              reset();
              setDlgOpen(true);
            }}
          >
            {language === "vi" ? "Thêm mới" : "Add"}
          </Button>
        </Box>
        <Box sx={{ height: 540, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.categoryId}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-row:hover": { bgcolor: "grey.50" },
              "& .MuiDataGrid-columnHeaders": { background: "#f5f5f5" },
            }}
          />
        </Box>
      </Box>
      <Footer />
      <Dialog
        open={dlgOpen}
        onClose={() => {
          setDlgOpen(false);
          reset();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {draft.categoryId
            ? language === "vi"
              ? "Sửa danh mục"
              : "Edit Category"
            : language === "vi"
            ? "Thêm danh mục"
            : "Add Category"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              autoFocus
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              {iconFile?.name || "Icon…"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files[0])}
              />
            </Button>
            {(iconFile || draft.icon) && (
              <Avatar
                src={
                  iconFile
                    ? URL.createObjectURL(iconFile)
                    : `/assets/icons/${draft.icon}`
                }
                sx={{ width: 64, height: 64 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDlgOpen(false);
              reset();
            }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button onClick={save} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}