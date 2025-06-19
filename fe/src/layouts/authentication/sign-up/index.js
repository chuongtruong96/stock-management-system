import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Alert,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

// Enhanced Sign-Up Component
export default function SignUp() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const departments = [
    "Human Resources",
    "Information Technology", 
    "Finance",
    "Marketing",
    "Operations",
    "Sales",
    "Administration",
    "Other"
  ];

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
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.department) {
      newErrors.department = "Please select a department";
    }
    
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
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
      // Simulate API call - replace with actual registration API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Account created successfully! Please sign in.");
      navigate("/auth/sign-in");
      
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
      setErrors({
        general: "Registration failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "grey.400" };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    
    const levels = [
      { label: "Very Weak", color: "error.main" },
      { label: "Weak", color: "warning.main" },
      { label: "Fair", color: "info.main" },
      { label: "Good", color: "success.light" },
      { label: "Strong", color: "success.main" }
    ];
    
    return { strength, ...levels[strength] };
  };

  const features = [
    "Secure account protection",
    "Access to all stationery management features", 
    "Real-time order tracking",
    "Department-based permissions",
    "24/7 customer support"
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
      {/* Animated Background */}
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

      <Container maxWidth="lg" sx={{ py: 4, minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Left Side - Info (Hidden on mobile) */}
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
                      Join Our Platform
                    </Typography>
                    <Typography
                      variant="h6"
                      color="rgba(255,255,255,0.8)"
                      sx={{ maxWidth: 500, lineHeight: 1.6, mb: 4 }}
                    >
                      Create your account and start managing your stationery 
                      supplies with our powerful, intuitive platform.
                    </Typography>
                  </Box>
                </Fade>

                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Typography variant="h6" color="white" gutterBottom fontWeight={600}>
                    What you'll get:
                  </Typography>
                  <Stack spacing={2}>
                    {features.map((feature, index) => (
                      <Fade in timeout={1200 + index * 200} key={index}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <CheckCircleIcon sx={{ color: "#4CAF50" }} />
                          <Typography color="rgba(255,255,255,0.9)">
                            {feature}
                          </Typography>
                        </Stack>
                      </Fade>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Slide>
          )}

          {/* Right Side - Registration Form */}
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
                    <PersonAddIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Create Account
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Join the stationery management platform
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
                          },
                        }}
                      />

                      {/* Email Field */}
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />

                      {/* Department Field */}
                      <TextField
                        fullWidth
                        select
                        label="Department"
                        value={formData.department}
                        onChange={handleInputChange("department")}
                        error={!!errors.department}
                        helperText={errors.department}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Password Field */}
                      <Box>
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
                            },
                          }}
                        />
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <Box sx={{ mt: 1 }}>
                            <Box
                              sx={{
                                height: 4,
                                bgcolor: "grey.200",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  height: "100%",
                                  width: `${(passwordStrength().strength / 4) * 100}%`,
                                  bgcolor: passwordStrength().color,
                                  transition: "all 0.3s ease",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{ color: passwordStrength().color, mt: 0.5 }}
                            >
                              Password strength: {passwordStrength().label}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Confirm Password Field */}
                      <TextField
                        fullWidth
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange("confirmPassword")}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />

                      {/* Terms Agreement */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{" "}
                            <Button variant="text" size="small" sx={{ p: 0, textTransform: "none" }}>
                              Terms and Conditions
                            </Button>
                          </Typography>
                        }
                        sx={{ alignSelf: "flex-start" }}
                      />
                      {errors.terms && (
                        <Typography variant="caption" color="error">
                          {errors.terms}
                        </Typography>
                      )}

                      {/* Sign Up Button */}
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
                        {loading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?
                    </Typography>
                  </Divider>

                  {/* Footer Links */}
                  <Stack direction="row" justifyContent="center">
                    <Button
                      component={Link}
                      to="/auth/sign-in"
                      variant="text"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Sign In Instead
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Slide>
        </Box>
      </Container>
    </Box>
  );
}