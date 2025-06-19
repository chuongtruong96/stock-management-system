import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Container,
  Stack,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  Avatar,
  Chip,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { authApi } from "services/api";
import { AuthContext } from "context/AuthContext";

// Enhanced Sign-In Component with Modern UI/UX
export default function SignIn() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showWelcome, setShowWelcome] = useState(true);

  const { login: authLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animation effects
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 3) {
      newErrors.password = "Password must be at least 3 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      });
      
      const token = response.token;
      const decoded = jwtDecode(token);

      // Save authentication data
      authLogin({
        token,
        username: decoded.sub ?? formData.username,
        roles: decoded.role ? [decoded.role] : decoded.roles,
      });

      // Save remember me preference
      localStorage.setItem("rememberMe", rememberMe);
      if (rememberMe) {
        localStorage.setItem("savedUsername", formData.username);
      } else {
        localStorage.removeItem("savedUsername");
      }

      toast.success("Welcome back! Redirecting...");
      
      // Smooth redirect with delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Login failed");
      setErrors({
        general: "Invalid username or password"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername && rememberMe) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername
      }));
    }
  }, [rememberMe]);

  const features = [
    {
      icon: <BusinessIcon />,
      title: "Enterprise Ready",
      description: "Built for business operations",
      color: "#2196F3"
    },
    {
      icon: <SecurityIcon />,
      title: "Secure & Reliable",
      description: "Advanced security protocols",
      color: "#4CAF50"
    },
    {
      icon: <SpeedIcon />,
      title: "Fast & Efficient",
      description: "Optimized performance",
      color: "#FF9800"
    },
    {
      icon: <SupportIcon />,
      title: "24/7 Support",
      description: "Always here to help",
      color: "#9C27B0"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />

      {/* Welcome Message */}
      <Collapse in={showWelcome}>
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <Chip
            icon={<BusinessIcon />}
            label="Welcome to Stationery Management System"
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              color: "primary.main",
              fontWeight: 600,
              px: 2,
              py: 1,
              fontSize: "0.9rem",
            }}
          />
        </Box>
      </Collapse>

      <Container maxWidth="lg" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Left Side - Features (Hidden on mobile) */}
          {!isMobile && (
            <Slide direction="right" in timeout={800}>
              <Box sx={{ flex: 1, pr: 4 }}>
                <Fade in timeout={1000}>
                  <Box sx={{ mb: 6 }}>
                    <Typography
                      variant="h2"
                      fontWeight={700}
                      color="white"
                      gutterBottom
                      sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
                    >
                      📋 Stationery
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight={600}
                      color="rgba(255,255,255,0.9)"
                      gutterBottom
                      sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
                    >
                      Management System
                    </Typography>
                    <Typography
                      variant="h6"
                      color="rgba(255,255,255,0.8)"
                      sx={{ maxWidth: 500, lineHeight: 1.6 }}
                    >
                      Streamline your office supplies with our comprehensive, 
                      secure, and user-friendly management platform.
                    </Typography>
                  </Box>
                </Fade>

                <Stack spacing={3}>
                  {features.map((feature, index) => (
                    <Fade in timeout={1200 + index * 200} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateX(10px)",
                            bgcolor: "rgba(255,255,255,0.15)",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: feature.color,
                              width: 48,
                              height: 48,
                            }}
                          >
                            {feature.icon}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              color="white"
                              gutterBottom
                            >
                              {feature.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="rgba(255,255,255,0.8)"
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Fade>
                  ))}
                </Stack>
              </Box>
            </Slide>
          )}

          {/* Right Side - Login Form */}
          <Slide direction="left" in timeout={600}>
            <Box sx={{ flex: isMobile ? 1 : 0.6, maxWidth: 480 }}>
              <Card
                elevation={24}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    p: 4,
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: "auto",
                      mb: 2,
                      bgcolor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Sign in to access your account
                  </Typography>
                </Box>

                {/* Form */}
                <Box sx={{ p: 4 }}>
                  {errors.general && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {errors.general}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      {/* Username Field */}
                      <TextField
                        fullWidth
                        label="Username"
                        value={formData.username}
                        onChange={handleInputChange("username")}
                        error={!!errors.username}
                        helperText={errors.username}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "primary.main",
                              },
                            },
                            "&.Mui-focused": {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderWidth: 2,
                              },
                            },
                          },
                        }}
                      />

                      {/* Password Field */}
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "primary.main",
                              },
                            },
                            "&.Mui-focused": {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderWidth: 2,
                              },
                            },
                          },
                        }}
                      />

                      {/* Remember Me */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Remember me"
                        sx={{ alignSelf: "flex-start" }}
                      />

                      {/* Sign In Button */}
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                            transform: "translateY(-2px)",
                          },
                          "&:disabled": {
                            background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                          },
                        }}
                      >
                        {loading ? "Signing In..." : "Sign In"}
                      </Button>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Need help?
                    </Typography>
                  </Divider>

                  {/* Footer Links */}
                  <Stack direction="row" justifyContent="center" spacing={2}>
                    <Button
                      component={Link}
                      to="/auth/reset-password"
                      variant="text"
                      size="small"
                      sx={{ textTransform: "none" }}
                    >
                      Forgot Password?
                    </Button>
                  </Stack>
                </Box>
              </Card>

              {/* Demo Credentials */}
              <Paper
                elevation={4}
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Demo Credentials:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Admin:</strong> admin / admin123
                  </Typography>
                  <Typography variant="body2">
                    <strong>User:</strong> hruser / hruser123
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Slide>
        </Box>
      </Container>
    </Box>
  );
}