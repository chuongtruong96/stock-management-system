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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InventoryIcon from "@mui/icons-material/Inventory";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Typography } from "@mui/material";
import AdminLayout from "layouts/AdminLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { categoryApi } from "services/api";

export default function CategoryManagement({ language = "en" }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [draft, setDraft] = useState({ categoryId: null, nameVn: "", nameEn: "", code: "", icon: "" });
  const [iconFile, setIconFile] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchRows = useCallback(async () => {
    try {
      const response = await categoryApi.all();
      console.log('Categories response:', response);
      setRows(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error("Failed to load categories");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const reset = () => {
    setDraft({ categoryId: null, nameVn: "", nameEn: "", code: "", icon: "" });
    setIconFile(null);
  };

  const save = async () => {
    if (!draft.nameEn.trim() || !draft.nameVn.trim()) {
      toast.warn(language === "vi" ? "Nhập tên tiếng Anh và tiếng Việt" : "English and Vietnamese names required");
      return;
    }
    if (!draft.code.trim()) {
      toast.warn(language === "vi" ? "Nhập mã danh mục" : "Category code required");
      return;
    }
    try {
      let saved;
      const payload = { 
        nameVn: draft.nameVn, 
        nameEn: draft.nameEn, 
        code: draft.code 
      };
      if (draft.categoryId) {
        saved = await categoryApi.update(draft.categoryId, payload);
      } else {
        saved = await categoryApi.create(payload);
      }

      if (iconFile) {
        const fd = new FormData();
        fd.append("file", iconFile);
        const tId = toast.loading("Uploading icon…");
        const catWithIcon = await categoryApi.uploadIcon(saved.categoryId, fd);
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
      await categoryApi.delete(id);
      setRows((r) => r.filter((x) => x.categoryId !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleMenuClick = (event, category) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCategory(null);
  };

  const handleViewProducts = () => {
    if (selectedCategory) {
      navigate(`/admin/product-management?categoryId=${selectedCategory.categoryId}`);
    }
    handleMenuClose();
  };

  const columns = [
    {
      field: "icon",
      headerName: "Icon",
      width: 80,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <img 
            src={`/assets/icons/${row.icon}`}
            alt={row.nameEn}
            style={{ 
              width: 48, 
              height: 48,
              objectFit: 'cover',
              borderRadius: '8px',
              border: '2px solid #1976d2',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48,
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: 2,
              display: 'none',
              bgcolor: 'primary.main'
            }}
          >
            <InventoryIcon />
          </Avatar>
        </Box>
      ),
    },
    {
      field: "code",
      headerName: "Code",
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ 
          bgcolor: 'grey.100', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 1,
          fontWeight: 600,
          color: 'primary.main'
        }}>
          {row.code}
        </Typography>
      )
    },
    { 
      field: "nameEn", 
      headerName: "English Name", 
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.nameEn}
        </Typography>
      )
    },
    { 
      field: "nameVn", 
      headerName: "Vietnamese Name", 
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.nameVn}
        </Typography>
      )
    },
    {
      field: "action",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="info"
            size="small"
            onClick={() => {
              setDraft(row);
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
            onClick={() => remove(row.categoryId)}
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

  return (
    <AdminLayout titleKey="categoryManagement" icon="category">
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
              <UploadIcon />
            </Avatar>
            {language === "vi" ? "Quản lý danh mục" : "Category Management"}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<UploadIcon />}
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
            {language === "vi" ? "Thêm mới" : "Add Category"}
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
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.categoryId}
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
        <MenuItem onClick={handleViewProducts} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <InventoryIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary={language === "vi" ? "Xem sản phẩm" : "View Products"}
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setDraft(selectedCategory);
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
          remove(selectedCategory?.categoryId);
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

      {/* Add/Edit Dialog */}
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
            <UploadIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {draft.categoryId
              ? language === "vi"
                ? "Sửa danh mục"
                : "Edit Category"
              : language === "vi"
              ? "Thêm danh mục"
              : "Add Category"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Stack spacing={3}>
            <TextField
              label={language === "vi" ? "Mã danh mục" : "Category Code"}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              autoFocus
              fullWidth
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
              placeholder={language === "vi" ? "Nhập mã danh mục" : "Enter category code"}
            />
            
            <TextField
              label={language === "vi" ? "Tên tiếng Anh" : "English Name"}
              value={draft.nameEn}
              onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
              fullWidth
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
              placeholder={language === "vi" ? "Nhập tên tiếng Anh" : "Enter English name"}
            />
            
            <TextField
              label={language === "vi" ? "Tên tiếng Việt" : "Vietnamese Name"}
              value={draft.nameVn}
              onChange={(e) => setDraft({ ...draft, nameVn: e.target.value })}
              fullWidth
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
              placeholder={language === "vi" ? "Nhập tên tiếng Việt" : "Enter Vietnamese name"}
            />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {language === "vi" ? "Biểu tượng danh mục" : "Category Icon"}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  py: 2,
                  px: 3,
                  fontSize: '1rem',
                  '&:hover': {
                    borderWidth: 2,
                    borderStyle: 'dashed',
                  }
                }}
                fullWidth
              >
                {iconFile?.name || (language === "vi" ? "Chọn biểu tượng..." : "Choose icon...")}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setIconFile(e.target.files[0])}
                />
              </Button>
            </Box>
            
            {(iconFile || draft.icon) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Avatar
                  src={
                    iconFile
                      ? URL.createObjectURL(iconFile)
                      : `/assets/icons/${draft.icon}`
                  }
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    boxShadow: 2
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => {
              setDlgOpen(false);
              reset();
            }}
            variant="outlined"
            size="large"
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
            onClick={save} 
            variant="contained"
            size="large"
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