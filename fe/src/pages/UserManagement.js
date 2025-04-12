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
  CircularProgress,
  Fade,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getDepartments,
  getEmployees,
  addEmployee,
} from "../services/api";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const UserManagement = ({ language }) => {
  const { auth, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
    employeeId: "",
  });
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: { departmentId: "" },
    position: "",
  });
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Thêm trạng thái lỗi

  useEffect(() => {
    if (!auth.token || !hasRole("ADMIN")) {
      toast.error(
        language === "vi"
          ? "Bạn cần đăng nhập với quyền admin để truy cập trang này."
          : "You need to log in with admin privileges to access this page.",
        { position: "top-right", autoClose: 3000 }
      );
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, departmentsRes, employeesRes] = await Promise.all([
          getUsers(),
          getDepartments(),
          getEmployees(),
        ]);
        console.log("Users data:", usersRes.data); // Debug dữ liệu
        console.log("Departments data:", departmentsRes.data);
        console.log("Employees data:", employeesRes.data);
        setUsers(usersRes.data || []);
        setDepartments(departmentsRes.data || []);
        setEmployees(employeesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
        const errorMessage = language === "vi"
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
    if (!newUser.username.trim()) {
      toast.error(
        language === "vi"
          ? "Vui lòng nhập tên đăng nhập"
          : "Username is required"
      );
      return false;
    }
    if (!isEdit && !newUser.password.trim()) {
      toast.error(
        language === "vi" ? "Vui lòng nhập mật khẩu" : "Password is required"
      );
      return false;
    }
    if (!newUser.employeeId) {
      toast.error(
        language === "vi"
          ? "Vui lòng chọn nhân viên"
          : "Please select an employee"
      );
      return false;
    }
    return true;
  };

  const validateEmployeeForm = () => {
    if (!newEmployee.firstName.trim()) {
      toast.error(
        language === "vi" ? "Vui lòng nhập họ" : "First name is required"
      );
      return false;
    }
    if (!newEmployee.lastName.trim()) {
      toast.error(
        language === "vi" ? "Vui lòng nhập tên" : "Last name is required"
      );
      return false;
    }
    if (!newEmployee.email.trim() || !/\S+@\S+\.\S+/.test(newEmployee.email)) {
      toast.error(
        language === "vi"
          ? "Vui lòng nhập email hợp lệ"
          : "Please enter a valid email"
      );
      return false;
    }
    if (!newEmployee.department.departmentId) {
      toast.error(
        language === "vi"
          ? "Vui lòng chọn phòng ban"
          : "Please select a department"
      );
      return false;
    }
    if (!newEmployee.position.trim()) {
      toast.error(
        language === "vi" ? "Vui lòng nhập vị trí" : "Position is required"
      );
      return false;
    }
    return true;
  };

  const handleEmployeeChange = (e) => {
    const selectedEmployeeId = e.target.value;
    const selectedEmployee = employees.find((emp) => emp.employeeId === selectedEmployeeId);

    if (editUser) {
      setEditUser({
        ...editUser,
        employee: selectedEmployee || { employeeId: selectedEmployeeId },
      });
    } else {
      setNewUser({ ...newUser, employeeId: selectedEmployeeId });
    }
  };

  const handleAddEmployee = async () => {
    if (!validateEmployeeForm()) return;

    try {
      const response = await addEmployee(newEmployee);
      setEmployees([...employees, response.data]);
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        department: { departmentId: "" },
        position: "",
      });
      setOpenEmployeeDialog(false);
      toast.success(
        language === "vi"
          ? "Thêm nhân viên thành công!"
          : "Employee added successfully!",
        { position: "top-right", autoClose: 2000 }
      );
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi khi thêm nhân viên: ${error.response?.data || error.message}`
          : `Error adding employee: ${error.response?.data || error.message}`,
        { position: "top-right", autoClose: 3000 }
      );
    }
  };

  const handleAddUser = async () => {
    if (!validateUserForm()) return;

    try {
      const response = await addUser(newUser);
      setUsers([...users, response.data]);
      setOpenDialog(false);
      setNewUser({ username: "", password: "", role: "user", employeeId: "" });
      toast.success(
        language === "vi"
          ? "Thêm người dùng thành công!"
          : "User added successfully!",
        { position: "top-right", autoClose: 2000 }
      );
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi khi thêm người dùng: ${error.response?.data || error.message}`
          : `Error adding user: ${error.response?.data || error.message}`,
        { position: "top-right", autoClose: 3000 }
      );
    }
  };

  const handleEditUser = async () => {
    if (!editUser.username.trim() || !editUser.employee.employeeId) {
      toast.error(
        language === "vi"
          ? "Tên đăng nhập và nhân viên không được để trống"
          : "Username and employee cannot be empty",
        { position: "top-right", autoClose: 3000 }
      );
      return;
    }
    const userToValidate = {
      username: editUser.username,
      password: editUser.password || "",
      role: editUser.role,
      employeeId: editUser.employee?.employeeId || "",
    };
    setNewUser(userToValidate);
    if (!validateUserForm(true)) {
      setNewUser({ username: "", password: "", role: "user", employeeId: "" });
      return;
    }
    setNewUser({ username: "", password: "", role: "user", employeeId: "" });
    try {
      const response = await updateUser(editUser.userId, {
        username: editUser.username,
        password: editUser.password,
        role: editUser.role,
        employeeId: editUser.employee.employeeId,
      });
      setUsers(
        users.map((user) =>
          user.userId === editUser.userId ? response.data : user
        )
      );
      setEditUser(null);
      setOpenDialog(false);
      toast.success(
        language === "vi"
          ? "Cập nhật người dùng thành công!"
          : "User updated successfully!",
        { position: "top-right", autoClose: 2000 }
      );
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi khi cập nhật người dùng: ${
              error.response?.data || error.message
            }`
          : `Error updating user: ${error.response?.data || error.message}`,
        { position: "top-right", autoClose: 3000 }
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        language === "vi"
          ? "Bạn có chắc chắn muốn xóa người dùng này?"
          : "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.userId !== userId));
      toast.success(
        language === "vi"
          ? "Xóa người dùng thành công!"
          : "User deleted successfully!",
        { position: "top-right", autoClose: 2000 }
      );
    } catch (error) {
      toast.error(
        language === "vi"
          ? `Lỗi khi xóa người dùng: ${error.response?.data || error.message}`
          : `Error deleting user: ${error.response?.data || error.message}`,
        { position: "top-right", autoClose: 3000 }
      );
    }
  };

  const columns = [
    {
      field: "username",
      headerName: language === "vi" ? "Tên Đăng Nhập" : "Username",
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: "medium", color: "#1976d2" }}>
          {params.value || "N/A"}
        </Typography>
      ),
    },
    {
      field: "role",
      headerName: language === "vi" ? "Vai Trò" : "Role",
      width: 100,
      renderCell: (params) => (
        <Typography sx={{ color: params.value === "admin" ? "#1976d2" : "#666" }}>
          {params.value || "N/A"}
        </Typography>
      ),
    },
    {
      field: "employee.firstName",
      headerName: language === "vi" ? "Họ" : "First Name",
      width: 150,
      renderCell: (params) => (
        <Typography>
          {params.row?.employee?.firstName || "N/A"}
        </Typography>
      ),
    },
    {
      field: "employee.lastName",
      headerName: language === "vi" ? "Tên" : "Last Name",
      width: 150,
      renderCell: (params) => (
        <Typography>
          {params.row?.employee?.lastName || "N/A"}
        </Typography>
      ),
    },
    {
      field: "employee.department.name",
      headerName: language === "vi" ? "Phòng Ban" : "Department",
      width: 200,
      renderCell: (params) => (
        <Typography>
          {params.row?.employee?.department?.name || "N/A"}
        </Typography>
      ),
    },
    {
      field: "action",
      headerName: language === "vi" ? "Hành Động" : "Action",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setEditUser(params.row);
              setOpenDialog(true);
            }}
            sx={{ textTransform: "none", px: 2 }}
          >
            {language === "vi" ? "Sửa" : "Edit"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteUser(params.row?.userId)}
            sx={{ textTransform: "none", px: 2 }}
          >
            {language === "vi" ? "Xóa" : "Delete"}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Fade in timeout={500}>
        <Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
          >
            {language === "vi" ? "Quản Lý Người Dùng" : "User Management"}
          </Typography>

          <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  transform: "scale(1.02)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              {language === "vi" ? "Thêm Người Dùng" : "Add User"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenEmployeeDialog(true)}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: 2,
                px: 3,
                py: 1,
                "&:hover": {
                  transform: "scale(1.02)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              {language === "vi" ? "Thêm Nhân Viên" : "Add Employee"}
            </Button>
          </Box>

          {error ? (
            <Typography
              variant="h6"
              color="error"
              sx={{ mt: 4, textAlign: "center" }}
            >
              {error}
            </Typography>
          ) : loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress size={60} color="primary" />
            </Box>
          ) : users.length === 0 ? (
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ mt: 4, textAlign: "center" }}
            >
              {language === "vi"
                ? "Chưa có người dùng nào."
                : "No users available."}
            </Typography>
          ) : (
            <Box
              sx={{
                height: 500,
                width: "100%",
                backgroundColor: "white",
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <DataGrid
                rows={users}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                getRowId={(row) => row.userId}
                disableSelectionOnClick
                treeData={false} // Tắt tính năng nhóm
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Fade>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditUser(null);
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white", mb: 2 }}>
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
            variant="outlined"
            autoFocus
            sx={{ "& .MuiInputLabel-root": { color: "#666" } }}
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
            variant="outlined"
            sx={{ "& .MuiInputLabel-root": { color: "#666" } }}
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
              <MenuItem value="ADMIN">
                {language === "vi" ? "Quản Trị" : "ADMIN"}
              </MenuItem>
              <MenuItem value="USER">
                {language === "vi" ? "Người Dùng" : "USER"}
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>
              {language === "vi" ? "Nhân Viên" : "Employee"}
            </InputLabel>
            <Select
              value={
                editUser
                  ? editUser.employee?.employeeId || ""
                  : newUser.employeeId
              }
              onChange={handleEmployeeChange}
            >
              <MenuItem value="">
                <em>
                  {language === "vi" ? "Chọn nhân viên" : "Select employee"}
                </em>
              </MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.employeeId} value={emp.employeeId}>
                  {`${emp.firstName} ${emp.lastName} (${emp.email})`}
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
            sx={{ textTransform: "none", color: "#666" }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            onClick={editUser ? handleEditUser : handleAddUser}
            color="primary"
            variant="contained"
            sx={{ textTransform: "none", px: 3 }}
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

      <Dialog
        open={openEmployeeDialog}
        onClose={() => setOpenEmployeeDialog(false)}
        TransitionComponent={Fade}
        transitionDuration={300}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white", mb: 2 }}>
          {language === "vi" ? "Thêm Nhân Viên" : "Add Employee"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={language === "vi" ? "Họ" : "First Name"}
            fullWidth
            margin="normal"
            value={newEmployee.firstName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, firstName: e.target.value })
            }
            variant="outlined"
            autoFocus
            sx={{ "& .MuiInputLabel-root": { color: "#666" } }}
          />
          <TextField
            label={language === "vi" ? "Tên" : "Last Name"}
            fullWidth
            margin="normal"
            value={newEmployee.lastName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, lastName: e.target.value })
            }
            variant="outlined"
            sx={{ "& .MuiInputLabel-root": { color: "#666" } }}
          />
          <TextField
            label={language === "vi" ? "Email" : "Email"}
            fullWidth
            margin="normal"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            variant="outlined"
            sx={{ "& .MuiInputLabel-root": { color: "#666" } }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>
              {language === "vi" ? "Phòng Ban" : "Department"}
            </InputLabel>
            <Select
              value={newEmployee.department.departmentId}
              onChange={(e) =>
                setNewEmployee({
                  ...newEmployee,
                  department: { departmentId: e.target.value },
                })
              }
            >
              <MenuItem value="">
                <em>
                  {language === "vi" ? "Chọn phòng ban" : "Select department"}
                </em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.departmentId} value={dept.departmentId}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={language === "vi" ? "Vị Trí" : "Position"}
            fullWidth
            margin="normal"
            value={newEmployee.position}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, position: e.target.value })
            }
            variant="outlined"
            sx={{ "& .MuiInputLabel-root": { color: "#666" } }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEmployeeDialog(false)}
            sx={{ textTransform: "none", color: "#666" }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            onClick={handleAddEmployee}
            color="primary"
            variant="contained"
            sx={{ textTransform: "none", px: 3 }}
          >
            {language === "vi" ? "Thêm" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;