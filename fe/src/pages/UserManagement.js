// src/pages/UserManagement.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getDepartments,
} from "../services/api";
import AddIcon from "@mui/icons-material/Add";
import "../assets/styles/custom.css";

const UserManagement = ({ language }) => {
  const { auth, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filter
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "USER",
    departmentId: "",
  });
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    if (!auth.token || !hasRole("ADMIN")) {
      toast.error(
        language === "vi"
          ? "Bạn cần đăng nhập với quyền admin."
          : "You need admin privileges.",
        { position: "top-right", autoClose: 3000 }
      );
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, departmentsRes] = await Promise.all([
          getUsers(),
          getDepartments(),
        ]);
        setUsers(usersRes.data || []);
        setDepartments(departmentsRes.data || []);
      } catch (error) {
        const errorMessage =
          language === "vi"
            ? `Lỗi khi tải dữ liệu: ${error.response?.data || error.message}`
            : `Error loading data: ${error.response?.data || error.message}`;
        setError(errorMessage);
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [language, auth, hasRole, navigate]);

  const validateUserForm = (isEdit = false) => {
    const user = isEdit ? editUser : newUser;
    if (!user.username.trim()) {
      toast.error(language === "vi" ? "Nhập username" : "Username required");
      return false;
    }
    if (!isEdit && !user.password.trim()) {
      toast.error(language === "vi" ? "Nhập mật khẩu" : "Password required");
      return false;
    }
    if (!user.departmentId) {
      toast.error(language === "vi" ? "Chọn phòng ban" : "Select department");
      return false;
    }
    return true;
  };

  const handleAddUser = async () => {
    if (!validateUserForm(false)) return;
    try {
      const payload = {
        ...newUser,
        departmentId: parseInt(newUser.departmentId, 10),
      };
      await addUser(payload);
      const { data } = await getUsers(); // refetch luôn bản mới nhất
      setUsers(data);
      setOpenDialog(false);
      setNewUser({
        username: "",
        password: "",
        role: "USER",
        departmentId: "",
      });
      toast.success(
        language === "vi" ? "Thêm user thành công!" : "User added!",
        { autoClose: 2000 }
      );
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi: ${error.response?.data || error.message}`
          : `Error: ${error.response?.data || error.message}`
      );
    }
  };

  const handleEditUser = async () => {
    if (!validateUserForm(true)) return;
    try {
      const payload = {
        ...editUser,
        departmentId: parseInt(editUser.departmentId, 10),
      };
      await updateUser(editUser.id, payload);
      const fresh = await getUsers();
      setUsers(fresh.data);
      setEditUser(null);
      setOpenDialog(false);
      toast.success(
        language === "vi" ? "Cập nhật user thành công!" : "User updated!",
        { autoClose: 2000 }
      );
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi update: ${error.response?.data || error.message}`
          : `Update error: ${error.response?.data || error.message}`
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        language === "vi"
          ? "Xóa người dùng?"
          : "Are you sure you want to delete?"
      )
    )
      return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(language === "vi" ? "Đã xóa" : "User deleted", {
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi khi xóa: ${error.message}`
          : `Delete error: ${error.message}`
      );
    }
  };

  const columns = [
    {
      field: "username",
      headerName: language === "vi" ? "Tên Đăng Nhập" : "Username",
      width: 150,
    },
    {
      field: "role",
      headerName: language === "vi" ? "Vai Trò" : "Role",
      width: 80,
    },
    {
      field: "departmentName",
      headerName: language === "vi" ? "Phòng Ban" : "Department",
      width: 220,
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setEditUser({
                id: params.row.id,
                username: params.row.username,
                password: "",
                role: params.row.role.toUpperCase(),
                departmentId: String(params.row.departmentId ?? "")
              });
              setOpenDialog(true);
            }}
            sx={{ mt: 1 }}
          >
            {language === "vi" ? "Sửa" : "Edit"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteUser(params.row.id)}
            sx={{ mt: 1 }}
          >
            {language === "vi" ? "Xóa" : "Delete"}
          </Button>
        </Box>
      ),
    },
  ];

  const filteredUsers = users
    .filter((u) => u && typeof u === "object") // bỏ phần tử rác
    .filter((u) => {
      const name = (u.username ?? "").toLowerCase(); // an toàn null
      const role = (u.role ?? "").toLowerCase();
      return (
        name.includes(searchUser.toLowerCase()) &&
        (!roleFilter || role === roleFilter)
      );
    });

  return (
    <Box sx={{ p: 3 }} className="fade-in-up">
      <Typography variant="h4" gutterBottom>
        {language === "vi" ? "Quản Lý Người Dùng" : "User Management"}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label={language === "vi" ? "Tìm username" : "Search username"}
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{language === "vi" ? "Vai Trò" : "Role"}</InputLabel>
          <Select
            value={roleFilter}
            label={language === "vi" ? "Vai Trò" : "Role"}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">{language === "vi" ? "Tất Cả" : "All"}</MenuItem>
            <MenuItem value="admin">admin</MenuItem>
            <MenuItem value="user">user</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditUser(null);
            setNewUser({
              username: "",
              password: "",
              role: "USER",
              departmentId: "",
            });
            setOpenDialog(true);
          }}
        >
          {language === "vi" ? "Thêm Người Dùng" : "Add User"}
        </Button>
      </Box>

      <Box className="custom-datagrid">
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.id}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          autoHeight
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditUser(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editUser
            ? language === "vi"
              ? "Sửa Người Dùng"
              : "Edit User"
            : language === "vi"
            ? "Thêm Người Dùng"
            : "Add User"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={language === "vi" ? "Tên Đăng Nhập" : "Username"}
            fullWidth
            margin="normal"
            value={editUser ? editUser.username : newUser.username}
            onChange={(e) =>
              editUser
                ? setEditUser({ ...editUser, username: e.target.value })
                : setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <TextField
            label={language === "vi" ? "Mật Khẩu" : "Password"}
            type="password"
            fullWidth
            margin="normal"
            value={editUser ? editUser.password : newUser.password}
            onChange={(e) =>
              editUser
                ? setEditUser({ ...editUser, password: e.target.value })
                : setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>{language === "vi" ? "Vai Trò" : "Role"}</InputLabel>
            <Select
              value={editUser ? editUser.role : newUser.role}
              onChange={(e) =>
                editUser
                  ? setEditUser({ ...editUser, role: e.target.value })
                  : setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="USER">USER</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>
              {language === "vi" ? "Phòng Ban" : "Department"}
            </InputLabel>
            <Select
              value={editUser ? editUser.departmentId : newUser.departmentId}
              onChange={(e) =>
                editUser
                  ? setEditUser({ ...editUser, departmentId: e.target.value })
                  : setNewUser({ ...newUser, departmentId: e.target.value })
              }
            >
              <MenuItem value="">
                <em>
                  {language === "vi" ? "Chọn phòng ban" : "Select department"}
                </em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setEditUser(null);
            }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            onClick={editUser ? handleEditUser : handleAddUser}
            variant="contained"
          >
            {editUser
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

export default UserManagement;
