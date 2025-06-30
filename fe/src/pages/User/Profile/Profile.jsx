import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
  Badge,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  PhotoCamera as PhotoCameraIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { AuthContext } from "context/AuthContext";
import { useTranslation } from "react-i18next";
import { userApi } from "services/api";

export default function ProfilePage() {
  const { auth } = useContext(AuthContext);
  const { t } = useTranslation('profile');
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  const [formData, setFormData] = useState({
    username: auth?.user?.username || "",
    email: auth?.user?.email || "",
    department: auth?.user?.department || "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    notifications: true,
    emailNotifications: true,
    theme: 'light',
  });

  const [userStats, setUserStats] = useState({
    totalOrders: 24,
    completedOrders: 18,
    pendingOrders: 6,
    joinDate: '2024-01-15',
  });

  useEffect(() => {
    // Load user preferences and stats
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Simulate API calls
      // const stats = await userApi.getUserStats();
      // const prefs = await userApi.getUserPreferences();
      // setUserStats(stats);
      // setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // await userApi.updateProfile(formData);
      toast.success(t('messages.profileUpdated'));
      setEditMode(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('validation.passwordMismatch'));
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error(t('validation.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      // await userApi.changePassword(passwordData);
      toast.success(t('messages.passwordChanged'));
      setPasswordMode(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    try {
      // await userApi.updatePreferences(preferences);
      toast.success(t('messages.preferencesUpdated') || "Preferences updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setPasswordMode(false);
    setFormData({
      username: auth?.user?.username || "",
      email: auth?.user?.email || "",
      department: auth?.user?.department || "",
    });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 4;
    
    if (formData.username) completed++;
    if (formData.email) completed++;
    if (formData.department) completed++;
    if (profilePicture || auth?.user?.avatar) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: "2rem",
              fontWeight: 600,
            }}
          >
            {auth?.user?.username?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {auth?.user?.username || "User"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<BadgeIcon />}
                label={auth?.user?.roles?.join(", ") || "User"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
              <Chip
                icon={<BusinessIcon />}
                label={auth?.user?.department || "No Department"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h5" fontWeight={600} color="primary">
                  <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  {t('sections.basicInfo')}
                </Typography>
                {!editMode && !passwordMode && (
                  <IconButton
                    color="primary"
                    onClick={() => setEditMode(true)}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Stack>

              <Stack spacing={3}>
                <TextField
                  label={t('fields.fullName')}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={!editMode}
                  fullWidth
                  variant={editMode ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />

                <TextField
                  label={t('fields.email')}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!editMode}
                  fullWidth
                  variant={editMode ? "outlined" : "filled"}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />

                <TextField
                  label={t('fields.department')}
                  value={formData.department}
                  disabled
                  fullWidth
                  variant="filled"
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />

                {editMode && (
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileUpdate}
                      disabled={loading}
                    >
                      {t('actions.save')}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                {t('sections.security')}
              </Typography>

              {!passwordMode ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('messages.securityDescription')}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setPasswordMode(true)}
                    startIcon={<SecurityIcon />}
                  >
                    {t('security.changePassword')}
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2}>
                  <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                    {t('validation.passwordMinLength')}
                  </Alert>

                  <TextField
                    label={t('security.currentPassword')}
                    type="password"
                    size="small"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    fullWidth
                  />

                  <TextField
                    label={t('security.newPassword')}
                    type="password"
                    size="small"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    fullWidth
                  />

                  <TextField
                    label={t('security.confirmPassword')}
                    type="password"
                    size="small"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancel}
                      fullWidth
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handlePasswordChange}
                      disabled={
                        loading ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      fullWidth
                    >
                      {t('actions.save')}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}