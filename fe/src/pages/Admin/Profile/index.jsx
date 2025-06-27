import { useState, useContext, useEffect } from "react";
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
  Paper,
  Stack,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
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
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Business as DepartmentIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import AdminLayout from "layouts/AdminLayout";
import { AuthContext } from "context/AuthContext";
import { userApi } from "services/api";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminProfile() {
  const { t, i18n } = useTranslation();
  const { auth, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: auth?.user?.username || "",
    email: auth?.user?.email || "",
    fullName: auth?.user?.fullName || "",
    phone: auth?.user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    language: i18n.language || 'en',
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    autoSave: true,
  });

  useEffect(() => {
    // Load user preferences from localStorage or API
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData({
      username: auth?.user?.username || "",
      email: auth?.user?.email || "",
      fullName: auth?.user?.fullName || "",
      phone: auth?.user?.phone || "",
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
      fullName: auth?.user?.fullName || "",
      phone: auth?.user?.phone || "",
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
        fullName: formData.fullName,
        phone: formData.phone,
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
          fullName: formData.fullName,
          phone: formData.phone,
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

  const handlePreferenceChange = (key) => (event) => {
    const newPrefs = {
      ...preferences,
      [key]: event.target.checked !== undefined ? event.target.checked : event.target.value
    };
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    
    // Apply language change immediately
    if (key === 'language') {
      i18n.changeLanguage(newPrefs.language);
    }
  };

  const getInitials = (name) => {
    if (!name) return auth?.user?.username?.charAt(0)?.toUpperCase() || "A";
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AdminLayout titleKey="profile" icon="person">
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        {/* Profile Header */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "rgba(255,255,255,0.2)",
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    border: "4px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {getInitials(formData.fullName || formData.username)}
                </Avatar>
              </Grid>
              
              <Grid item xs>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {formData.fullName || formData.username || "Admin User"}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  {formData.email || "admin@example.com"}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={<BadgeIcon />}
                    label={auth?.user?.roles?.[0] || "ADMIN"}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "bold",
                      "& .MuiChip-icon": { color: "white" }
                    }}
                  />
                  <Chip
                    icon={<DepartmentIcon />}
                    label={auth?.user?.departmentName || "Administration"}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: "bold",
                      "& .MuiChip-icon": { color: "white" }
                    }}
                  />
                  <Chip
                    icon={<ShieldIcon />}
                    label="Verified Admin"
                    sx={{
                      bgcolor: "rgba(76, 175, 80, 0.8)",
                      color: "white",
                      fontWeight: "bold",
                      "& .MuiChip-icon": { color: "white" }
                    }}
                  />
                </Stack>
              </Grid>
              
              <Grid item>
                {!editing ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      }
                    }}
                  >
                    {t("edit") || "Edit Profile"}
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{
                        borderColor: "rgba(255,255,255,0.5)",
                        color: "white",
                        "&:hover": {
                          borderColor: "white",
                          bgcolor: "rgba(255,255,255,0.1)"
                        }
                      }}
                    >
                      {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        bgcolor: "rgba(76, 175, 80, 0.8)",
                        "&:hover": {
                          bgcolor: "rgba(76, 175, 80, 1)",
                        }
                      }}
                    >
                      {t("save") || "Save Changes"}
                    </Button>
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Tabs Navigation */}
        <Card elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  minHeight: 64,
                  fontSize: "1rem",
                  fontWeight: 600,
                }
              }}
            >
              <Tab 
                icon={<PersonIcon />} 
                label={t("personalInfo") || "Personal Info"} 
                iconPosition="start"
              />
              <Tab 
                icon={<SecurityIcon />} 
                label={t("security") || "Security"} 
                iconPosition="start"
              />
              <Tab 
                icon={<NotificationsIcon />} 
                label={t("preferences") || "Preferences"} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Personal Information Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
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
                  sx={{ mb: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("fullName") || "Full Name"}
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
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
                  sx={{ mb: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("phone") || "Phone Number"}
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("department") || "Department"}
                  value={auth?.user?.departmentName || "Administration"}
                  disabled
                  variant="filled"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DepartmentIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("role") || "Role"}
                  value={auth?.user?.roles?.[0] || "ADMIN"}
                  disabled
                  variant="filled"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={1}>
            {editing ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    {t("passwordChangeNote") || "Leave password fields empty if you don't want to change your password."}
                  </Alert>
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
              </Grid>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" />
                  {t("securitySettings") || "Security Settings"}
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("passwordProtection") || "Password Protection"}
                      secondary={t("passwordProtectionDesc") || "Your account is protected with a strong password"}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={t("active") || "Active"} color="success" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <ShieldIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("adminPrivileges") || "Admin Privileges"}
                      secondary={t("adminPrivilegesDesc") || "You have full administrative access"}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={t("enabled") || "Enabled"} color="primary" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            )}
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" />
              {t("preferences") || "Preferences"}
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("language") || "Language"}
                  secondary={t("languageDesc") || "Choose your preferred language"}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handlePreferenceChange('language')({ target: { value: preferences.language === 'en' ? 'vi' : 'en' } })}
                  >
                    {preferences.language === 'en' ? 'English' : 'Tiếng Việt'}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("emailNotifications") || "Email Notifications"}
                  secondary={t("emailNotificationsDesc") || "Receive notifications via email"}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange('emailNotifications')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("pushNotifications") || "Push Notifications"}
                  secondary={t("pushNotificationsDesc") || "Receive push notifications in browser"}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.pushNotifications}
                    onChange={handlePreferenceChange('pushNotifications')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("autoSave") || "Auto Save"}
                  secondary={t("autoSaveDesc") || "Automatically save changes"}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.autoSave}
                    onChange={handlePreferenceChange('autoSave')}
                    color="primary"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>
        </Card>
      </Box>
    </AdminLayout>
  );
}