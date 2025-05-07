// src/pages/UnitManagement.jsx
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { getUnits, addUnit, updateUnit, deleteUnit } from "../services/api";

const UnitManagement = ({ language }) => {
  const [units, setUnits] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUnit, setNewUnit] = useState({ nameEn: "", nameVn: "" });
  const [editUnit, setEditUnit] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await getUnits();
        setUnits(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching units:", error);
        setError(
          language === "vi"
            ? "Lỗi khi tải danh sách đơn vị"
            : "Error loading units"
        );
      }
    };
    fetchUnits();
  }, [language]);

  const handleAddUnit = async () => {
    try {
      const response = await addUnit(newUnit);
      setUnits([...units, response.data]);
      setOpenDialog(false);
      setNewUnit({ nameEn: "", nameVn: "" });
    } catch (error) {
      alert(language === "vi" ? "Lỗi khi thêm đơn vị" : "Error adding unit");
    }
  };

  const handleEditUnit = async () => {
    try {
      const response = await updateUnit(editUnit.id, editUnit);
      setUnits(
        units.map((u) => (u.id === editUnit.id ? response.data : u))
      );
      setEditUnit(null);
      setOpenDialog(false);
    } catch (error) {
      alert(
        language === "vi" ? "Lỗi khi cập nhật đơn vị" : "Error updating unit"
      );
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm(language === "vi" ? "Xác nhận xóa?" : "Delete confirm?"))
      return;
    try {
      await deleteUnit(unitId);
      setUnits(units.filter((u) => u.id !== unitId));
    } catch (error) {
      alert(
        language === "vi" ? "Lỗi khi xóa đơn vị" : "Error deleting unit"
      );
    }
  };

  const columns = [
    {
      field: "nameEn",
      headerName: language === "vi" ? "Tên (Tiếng Anh)" : "Name (English)",
      width: 200,
    },
    {
      field: "nameVn",
      headerName: language === "vi" ? "Tên (Tiếng Việt)" : "Name (Vietnamese)",
      width: 200,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditUnit(params.row);
              setOpenDialog(true);
            }}
            sx={{ mr: 1 }}
          >
            {language === "vi" ? "Sửa" : "Edit"}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteUnit(params.row.id)}
          >
            {language === "vi" ? "Xóa" : "Delete"}
          </Button>
        </>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Quản Lý Đơn Vị" : "Unit Management"}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        {language === "vi" ? "Thêm Đơn Vị" : "Add Unit"}
      </Button>
      <Box className="custom-datagrid">
        <DataGrid
          rows={units}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          autoHeight
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditUnit(null);
        }}
      >
        <DialogTitle>
          {editUnit
            ? language === "vi"
              ? "Sửa Đơn Vị"
              : "Edit Unit"
            : language === "vi"
            ? "Thêm Đơn Vị"
            : "Add Unit"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={
              language === "vi"
                ? "Tên (Tiếng Anh)"
                : "Name (English)"
            }
            fullWidth
            margin="normal"
            value={editUnit ? editUnit.nameEn : newUnit.nameEn}
            onChange={(e) =>
              editUnit
                ? setEditUnit({ ...editUnit, nameEn: e.target.value })
                : setNewUnit({ ...newUnit, nameEn: e.target.value })
            }
          />
          <TextField
            label={
              language === "vi"
                ? "Tên (Tiếng Việt)"
                : "Name (Vietnamese)"
            }
            fullWidth
            margin="normal"
            value={editUnit ? editUnit.nameVn : newUnit.nameVn}
            onChange={(e) =>
              editUnit
                ? setEditUnit({ ...editUnit, nameVn: e.target.value })
                : setNewUnit({ ...newUnit, nameVn: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setEditUnit(null);
            }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            onClick={editUnit ? handleEditUnit : handleAddUnit}
            variant="contained"
          >
            {editUnit
              ? language === "vi"
                ? "Cập Nhật"
                : "Update"
              : language === "vi"
              ? "Thêm"
              : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnitManagement;
