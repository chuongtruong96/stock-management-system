import { useEffect, useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import { toast } from "react-toastify";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAdd from "@mui/icons-material/PersonAdd";

import { userApi, departmentApi } from "services/api"; // Already correctly imported

import { AuthContext } from "context/AuthContext";
import { buildTable } from "./tableData";

export default function UserManagement({ language = "en" }) {
  const { auth, hasRole } = useContext(AuthContext);
  const navigate = useNavigate(); // Renamed for clarity
  useEffect(() => {
    if (!auth.token || !hasRole("ADMIN")) {
      toast.error(
        language === "vi"
          ? "Bạn cần đăng nhập với quyền admin"
          : "Admin privileges required"
      );
      navigate("/");
    }
  }, [auth, hasRole, language, navigate]);

  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);

  const blank = {
    id: null,
    username: "",
    password: "",
    role: "USER",
    deptId: "",
  };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(blank);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [u, d] = await Promise.all([userApi.getAll(), departmentApi.getAll()]); // Updated method names to getAll for consistency
        setUsers(u);
        setDepts(d);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reset = () => setDraft(blank);

  const validate = () => {
    if (!draft.username.trim())
      return (
        toast.error(language === "vi" ? "Nhập username" : "Enter username"),
        false
      );
    if (!draft.id && !draft.password.trim())
      return (
        toast.error(language === "vi" ? "Nhập mật khẩu" : "Enter password"),
        false
      );
    if (!draft.deptId)
      return (
        toast.error(language === "vi" ? "Chọn phòng ban" : "Select department"),
        false
      );
    return true;
  };

  const saveUser = async () => {
    if (!validate()) return;
    try {
      const body = {
        username: draft.username,
        password: draft.password || undefined,
        role: draft.role,
        departmentId: parseInt(draft.deptId, 10),
      };
      if (draft.id) {
        await userApi.update(draft.id, body);
        toast.success("Updated");
      } else {
        await userApi.create(body); // Updated to use userApi.create for consistency
        toast.success("Added");
      }
      const usersResponse = await userApi.getAll(); // Updated to getAll
      setUsers(usersResponse);
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e.message || "Operation failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm(language === "vi" ? "Xoá người dùng?" : "Delete user?"))
      return;
    try {
      await userApi.delete(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const tableObj = useMemo(() => {
    const rows = users.map((u) => ({
      ...u,
      dept: u.departmentName || u.department?.name || "–",
      action: (
        <>
          <Tooltip title={language === "vi" ? "Sửa" : "Edit"}>
            <IconButton
              size="small"
              color="info"
              onClick={() => {
                setDraft({
                  id: u.id,
                  username: u.username,
                  password: "",
                  role: u.role.toUpperCase(),
                  deptId: String(u.departmentId ?? ""),
                });
                setOpen(true);
              }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title={language === "vi" ? "Xóa" : "Delete"}>
            <IconButton
              size="small"
              color="error"
              onClick={() => remove(u.id)}
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      ),
    }));
    return buildTable(rows, language);
  }, [users, language, remove]); // Added remove as a dependency

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
              {language === "vi" ? "Quản lý người dùng" : "User Management"}
            </MDBox>
            <MDButton
              variant="gradient"
              color="light"
              size="small"
              startIcon={<PersonAdd />}
              sx={{ ml: "auto", color: "" }}
              onClick={() => {
                reset();
                setOpen(true);
              }}
            >
              {language === "vi" ? "Thêm người dùng" : "Add User"}
            </MDButton>
          </MDBox>
          <MDBox pt={3} px={2}>
            <DataTable
              table={tableObj}
              isSorted={true}
              canSearch={true}
              showTotalEntries={true}
              entriesPerPage={true}
              noEndBorder
              loading={loading}
            />
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {draft.id
            ? language === "vi"
              ? "Sửa người dùng"
              : "Edit User"
            : language === "vi"
            ? "Thêm người dùng"
            : "Add User"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value })}
          />
          {!draft.id && (
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Password"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={draft.role}
              label="Role"
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="USER">USER</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>
              {language === "vi" ? "Phòng ban" : "Department"}
            </InputLabel>
            <Select
              value={draft.deptId}
              label="Department"
              onChange={(e) => setDraft({ ...draft, deptId: e.target.value })}
            >
              <MenuItem value="">
                <em>{language === "vi" ? "Chưa chọn" : "None"}</em>
              </MenuItem>
              {depts.map((d) => (
                <MenuItem key={d.id} value={String(d.id)}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="text"
            color="secondary"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            {language === "vi" ? "Hủy" : "Cancel"}
          </MDButton>
          <MDButton color="info" variant="gradient" onClick={saveUser}>
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