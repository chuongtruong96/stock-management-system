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
  Typography,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AdminLayout from "layouts/AdminLayout";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { unitApi } from "services/api";

export default function UnitManagement({ language = "en" }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [draft, setDraft] = useState({ 
    id: null, 
    nameEn: "",
    nameVn: ""
  });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Fetch units data
  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await unitApi.all();
      console.log('Units response:', response); // Debug log
      setRows(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to load units:", err);
      setError(err);
      toast.error(t("failedToLoadUnits") || "Failed to load units");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Reset form
  const reset = () => {
    setDraft({ 
      id: null, 
      nameEn: "",
      nameVn: ""
    });
  };

  // Handle save
  const save = async () => {
    try {
      // Validation
      if (!draft.nameEn?.trim()) {
        toast.warn(t("unitNameRequired") || "Unit name (English) is required");
        return;
      }

      if (!draft.nameVn?.trim()) {
        toast.warn(t("unitNameVnRequired") || "Unit name (Vietnamese) is required");
        return;
      }

      const payload = {
        nameEn: draft.nameEn,
        nameVn: draft.nameVn,
      };

      let response;
      if (draft.id) {
        response = await unitApi.update(draft.id, payload);
        setRows((prev) => prev.map((unit) => 
          unit.id === response.id ? response : unit
        ));
        toast.success(t("unitUpdated") || "Unit updated successfully");
      } else {
        response = await unitApi.add(payload);
        setRows((prev) => [...prev, response]);
        toast.success(t("unitAdded") || "Unit added successfully");
      }

      setDlgOpen(false);
      reset();
    } catch (err) {
      console.error("Failed to save unit:", err);
      toast.error(err.response?.data?.message || err.message || "Save failed");
    }
  };

  // Handle delete
  const remove = async (id) => {
    if (!window.confirm(t("confirmDeleteUnit") || "Are you sure you want to delete this unit?")) {
      return;
    }

    try {
      await unitApi.delete(id);
      setRows((prev) => prev.filter((unit) => unit.id !== id));
      toast.success(t("unitDeleted") || "Unit deleted successfully");
    } catch (err) {
      console.error("Failed to delete unit:", err);
      toast.error(err.response?.data?.message || err.message || "Delete failed");
    }
  };

  // Handle menu actions
  const handleMenuClick = (event, unit) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedUnit(null);
  };

  const handleViewDetails = () => {
    if (selectedUnit) {
      toast.info(`Unit Details: ${selectedUnit.nameEn} (${selectedUnit.nameVn})`);
    }
    handleMenuClose();
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ 
          bgcolor: 'grey.100', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 1,
          fontWeight: 600,
          color: 'primary.main'
        }}>
          #{row.id}
        </Typography>
      ),
    },
    {
      field: "nameEn",
      headerName: language === "vi" ? "Tên tiếng Anh" : "English Name",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.nameEn || "—"}
        </Typography>
      ),
    },
    {
      field: "nameVn",
      headerName: language === "vi" ? "Tên tiếng Việt" : "Vietnamese Name",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.nameVn || "—"}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: language === "vi" ? "Thao tác" : "Actions",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="info"
            size="small"
            onClick={() => {
              setDraft({
                id: row.id,
                nameEn: row.nameEn || "",
                nameVn: row.nameVn || "",
              });
              setDlgOpen(true);
            }}
            sx={{
              bgcolor: 'info.50',
              '&:hover': { bgcolor: 'info.100' }
            }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => remove(row.id)}
            sx={{
              bgcolor: 'error.50',
              '&:hover': { bgcolor: 'error.100' }
            }}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, row)}
            sx={{
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <MoreVertIcon fontSize="inherit" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <AdminLayout titleKey="unitManagement" icon="category">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              {t("errorLoadingUnits") || "Error Loading Units"}
            </Typography>
            <Typography variant="body2">
              {error?.message || "Failed to load units"}
            </Typography>
            <Button onClick={fetchRows} sx={{ mt: 2 }}>
              {t("retry") || "Retry"}
            </Button>
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="unitManagement" icon="category">
      <Box sx={{ p: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            boxShadow: 1
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <CategoryIcon />
            </Avatar>
            {language === "vi" ? "Quản lý đơn vị" : "Unit Management"}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CategoryIcon />}
            onClick={() => {
              reset();
              setDlgOpen(true);
            }}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            {language === "vi" ? "Thêm mới" : "Add Unit"}
          </Button>
        </Box>
        
        <Box sx={{ 
          height: 600, 
          width: "100%",
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1
        }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
              rowHeight={80}
              sx={{
                border: 'none',
                "& .MuiDataGrid-root": {
                  border: 'none',
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                },
                "& .MuiDataGrid-columnHeaders": { 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  minHeight: '56px !important',
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 'bold',
                },
                "& .MuiDataGrid-row": {
                  minHeight: '80px !important',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                    transform: 'translateY(-1px)',
                  },
                },
                "& .MuiDataGrid-toolbarContainer": {
                  padding: '16px',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fafafa',
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 200,
          }
        }}
      >
        <MenuItem onClick={handleViewDetails} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={language === "vi" ? "Xem chi tiết" : "View Details"}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setDraft(selectedUnit);
          setDlgOpen(true);
          handleMenuClose();
        }} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText 
            primary={language === "vi" ? "Chỉnh sửa" : "Edit"}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>
        <MenuItem onClick={() => {
          remove(selectedUnit?.id);
          handleMenuClose();
        }} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary={language === "vi" ? "Xóa" : "Delete"}
            primaryTypographyProps={{ fontWeight: 500, color: 'error.main' }}
          />
        </MenuItem>
      </Menu>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog
        open={dlgOpen}
        onClose={() => {
          setDlgOpen(false);
          reset();
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <CategoryIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {draft.id
              ? language === "vi"
                ? "Sửa đơn vị"
                : "Edit Unit"
              : language === "vi"
              ? "Thêm đơn vị"
              : "Add Unit"}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 4 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              autoFocus
              label={t("unitNameEn") || "Unit Name (English)"}
              value={draft.nameEn}
              onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
              placeholder={t("enterUnitNameEn") || "Enter unit name in English"}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
            />
            
            <TextField
              fullWidth
              label={t("unitNameVn") || "Unit Name (Vietnamese)"}
              value={draft.nameVn}
              onChange={(e) => setDraft({ ...draft, nameVn: e.target.value })}
              placeholder={t("enterUnitNameVn") || "Enter unit name in Vietnamese"}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              setDlgOpen(false);
              reset();
            }}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={save}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              '&:hover': {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              }
            }}
          >
            {language === "vi" ? "Lưu" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}