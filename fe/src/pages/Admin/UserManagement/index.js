import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Person from "@mui/icons-material/Person";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AdminLayout from "layouts/AdminLayout";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { userApi, departmentApi } from "services/api";
import { AuthContext } from "context/AuthContext";

export default function UserManagement({ language = "en" }) {
  const { t } = useTranslation();
  const { auth, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const blank = {
    id: null,
    username: "",
    email: "",
    password: "",
    role: "USER",
    departmentId: "",
  };
  const [draft, setDraft] = useState(blank);

  // Check admin privileges
  useEffect(() => {
    if (!auth.token || !hasRole("ADMIN")) {
      toast.error(t("adminPrivilegesRequired") || "Admin privileges required");
      navigate("/");
    }
  }, [auth, hasRole, navigate, t]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersResponse, departmentsResponse] = await Promise.all([
        userApi.getUsers(),
        departmentApi.all(),
      ]);
      console.log('Users response:', usersResponse); // Debug log
      console.log('Departments response:', departmentsResponse); // Debug log
      setRows(Array.isArray(usersResponse) ? usersResponse : []);
      setDepartments(Array.isArray(departmentsResponse) ? departmentsResponse : []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err);
      toast.error(t("failedToLoadData") || "Failed to load data");
      setRows([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reset = () => setDraft(blank);

  // Validation
  const validate = () => {
    if (!draft.username?.trim()) {
      toast.error(t("usernameRequired") || "Username is required");
      return false;
    }
    if (!draft.email?.trim()) {
      toast.error(t("emailRequired") || "Email is required");
      return false;
    }
    if (!draft.id && !draft.password?.trim()) {
      toast.error(t("passwordRequired") || "Password is required for new users");
      return false;
    }
    if (!draft.departmentId) {
      toast.error(t("departmentRequired") || "Department is required");
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      const body = {
        username: draft.username,
        email: draft.email,
        role: draft.role,
        departmentId: parseInt(draft.departmentId, 10),
      };

      if (draft.password?.trim()) {
        body.password = draft.password;
      }

      if (draft.id) {
        await userApi.updateUser(draft.id, body);
        toast.success(t("userUpdated") || "User updated successfully");
      } else {
        await userApi.addUser(body);
        toast.success(t("userAdded") || "User added successfully");
      }
      
      await fetchData(); // Refresh data
      setDlgOpen(false);
      reset();
    } catch (e) {
      console.error("Failed to save user:", e);
      toast.error(e.response?.data?.message || e.message || "Operation failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm(t("confirmDeleteUser") || "Are you sure you want to delete this user?"))
      return;
    try {
      await userApi.deleteUser(id);
      setRows((u) => u.filter((x) => x.id !== id));
      toast.success(t("userDeleted") || "User deleted successfully");
    } catch (e) {
      console.error("Failed to delete user:", e);
      toast.error(e.response?.data?.message || e.message || "Delete failed");
    }
  };

  // Get department name
  const getDepartmentName = useCallback((departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || "—";
  }, [departments]);

  // Handle menu actions
  const handleMenuClick = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleViewDetails = () => {
    if (selectedUser) {
      toast.info(`User Details: ${selectedUser.username} (${selectedUser.email})`);
    }
    handleMenuClose();
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 70,
      renderCell: ({ row }) => (
        <Avatar sx={{ width: 32, height: 32 }}>
          {row.username?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
      ),
    },
    {
      field: "user",
      headerName: language === "vi" ? "Người dùng" : "User",
      flex: 1,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {row.username || "—"}
          </Typography>
          {row.email && (
            <Typography variant="caption" color="textSecondary">
              {row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "role",
      headerName: language === "vi" ? "Vai tr��" : "Role",
      width: 150,
      renderCell: ({ row }) => (
        <Chip
          icon={row.role === "ADMIN" ? <AdminPanelSettings /> : <AccountCircle />}
          label={row.role || "USER"}
          size="small"
          color={row.role === "ADMIN" ? "primary" : "default"}
          variant={row.role === "ADMIN" ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "department",
      headerName: language === "vi" ? "Phòng ban" : "Department",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography variant="body2">
          {getDepartmentName(row.departmentId)}
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
                username: row.username || "",
                email: row.email || "",
                password: "",
                role: row.role || "USER",
                departmentId: String(row.departmentId || ""),
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
            disabled={row.id === auth.user?.id} // Prevent self-deletion
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
      <AdminLayout titleKey="userManagement" icon="person">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              {t("errorLoadingUsers") || "Error Loading Users"}
            </Typography>
            <Typography variant="body2">
              {error?.message || "Failed to load users"}
            </Typography>
            <Button onClick={fetchData} sx={{ mt: 2 }}>
              {t("retry") || "Retry"}
            </Button>
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="userManagement" icon="person">
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
              <Person />
            </Avatar>
            {language === "vi" ? "Quản lý người dùng" : "User Management"}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
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
            {language === "vi" ? "Thêm mới" : "Add User"}
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
          setDraft(selectedUser);
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
        <MenuItem 
          onClick={() => {
            remove(selectedUser?.id);
            handleMenuClose();
          }} 
          sx={{ py: 1.5 }}
          disabled={selectedUser?.id === auth.user?.id} // Prevent self-deletion
        >
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
            <Person />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {draft.id
              ? language === "vi"
                ? "Sửa người dùng"
                : "Edit User"
              : language === "vi"
              ? "Thêm người dùng"
              : "Add User"}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 4 }}>
          <Stack spacing={3}>
            {draft.id === auth.user?.id && (
              <Alert severity="info">
                {t("editingOwnAccount") || "You are editing your own account"}
              </Alert>
            )}
            
            <TextField
              fullWidth
              autoFocus
              label={t("username") || "Username"}
              value={draft.username}
              onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              placeholder={t("enterUsername") || "Enter username"}
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
              type="email"
              label={t("email") || "Email"}
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder={t("enterEmail") || "Enter email address"}
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
              type="password"
              label={t("password") || "Password"}
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              placeholder={draft.id ? t("leaveBlankToKeep") || "Leave blank to keep current password" : t("enterPassword") || "Enter password"}
              required={!draft.id}
              helperText={draft.id ? t("passwordHelp") || "Leave blank to keep current password" : ""}
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
            
            <FormControl 
              fullWidth 
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
            >
              <InputLabel>{t("role") || "Role"}</InputLabel>
              <Select
                value={draft.role}
                label={t("role") || "Role"}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              >
                <MenuItem value="USER">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountCircle fontSize="small" />
                    USER
                  </Box>
                </MenuItem>
                <MenuItem value="ADMIN">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminPanelSettings fontSize="small" />
                    ADMIN
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <FormControl 
              fullWidth 
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
            >
              <InputLabel>{t("department") || "Department"}</InputLabel>
              <Select
                value={draft.departmentId}
                label={t("department") || "Department"}
                onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}
              >
                <MenuItem value="">
                  <em>{t("selectDepartment") || "Select Department"}</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={String(dept.id)}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            {draft.id
              ? (language === "vi" ? "Cập nhật" : "Update")
              : (language === "vi" ? "Thêm" : "Add")
            }
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}