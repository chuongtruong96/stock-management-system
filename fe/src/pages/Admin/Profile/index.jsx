import { useState, useContext } from "react";
import {
  Box,
  Card,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import AdminLayout from "layouts/AdminLayout";
import { AuthContext } from "context/AuthContext";
import { userApi } from "services/api";

export default function AdminProfile() {
  const { t } = useTranslation();
  const { auth, updateUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: auth?.user?.username || "",
    email: auth?.user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEdit = () => {
    setEditing(true);
    setFormData({
      username: auth?.user?.username || "",
      email: auth?.user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      username: auth?.user?.username || "",
      email: auth?.user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.username.trim()) {
        toast.error(t("usernameRequired") || "Username is required");
        return;
      }

      if (!formData.email.trim()) {
        toast.error(t("emailRequired") || "Email is required");
        return;
      }

      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast.error(t("passwordsDoNotMatch") || "Passwords do not match");
        return;
      }

      if (formData.newPassword && !formData.currentPassword) {
        toast.error(t("currentPasswordRequired") || "Current password is required to change password");
        return;
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      await userApi.updateUser(auth.user.id, updateData);
      
      // Update auth context
      if (updateUser) {
        updateUser({
          ...auth.user,
          username: formData.username,
          email: formData.email,
        });
      }

      toast.success(t("profileUpdated") || "Profile updated successfully");
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <AdminLayout titleKey="profile" icon="person">
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Card elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            textAlign: "center"
          }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: "2rem",
                fontWeight: "bold"
              }}
            >
              {auth?.user?.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {auth?.user?.username || "User"}
            </Typography>
            <Chip
              icon={<BadgeIcon />}
              label={auth?.user?.roles?.[0] || "USER"}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: "bold"
              }}
            />
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" />
                {t("profileInformation") || "Profile Information"}
              </Typography>
              
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ borderRadius: 2 }}
                >
                  {t("edit") || "Edit"}
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ borderRadius: 2 }}
                  >
                    {t("cancel") || "Cancel"}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    loading={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    {t("save") || "Save"}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("username") || "Username"}
                  value={formData.username}
                  onChange={handleChange("username")}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("email") || "Email"}
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Password Change Section */}
              {editing && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        {t("changePassword") || "Change Password (Optional)"}
                      </Typography>
                    </Divider>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={t("currentPassword") || "Current Password"}
                      type={showPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange("currentPassword")}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={t("newPassword") || "New Password"}
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange("newPassword")}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label={t("confirmPassword") || "Confirm Password"}
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange("confirmPassword")}
                      variant="outlined"
                      error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== ""}
                      helperText={
                        formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== ""
                          ? (t("passwordsDoNotMatch") || "Passwords do not match")
                          : ""
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {t("passwordChangeNote") || "Leave password fields empty if you don't want to change your password."}
                    </Alert>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Card>
      </Box>
    </AdminLayout>
  );
}