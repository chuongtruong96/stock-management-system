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
  InputAdornment,
  Paper,
  Avatar,
  Alert,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  LockReset as LockResetIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

// Enhanced Reset Password Component
export default function ResetPassword() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Form state
  const [step, setStep] = useState(0); // 0: email, 1: code, 2: new password, 3: success
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = ["Enter Email", "Verify Code", "New Password", "Complete"];

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    switch (step) {
      case 0: // Email step
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }
        break;

      case 1: // Code step
        if (!formData.resetCode.trim()) {
          newErrors.resetCode = "Reset code is required";
        } else if (formData.resetCode.length !== 6) {
          newErrors.resetCode = "Reset code must be 6 digits";
        }
        break;

      case 2: // New password step
        if (!formData.newPassword.trim()) {
          newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 6) {
          newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    try {
      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1500));

      switch (step) {
        case 0: // Send reset email
          toast.success("Reset code sent to your email!");
          setStep(1);
          break;

        case 1: // Verify code
          toast.success("Code verified successfully!");
          setStep(2);
          break;

        case 2: // Reset password
          toast.success("Password reset successfully!");
          setStep(3);
          break;
      }
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Something went wrong. Please try again.");
      setErrors({
        general: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Enter your email address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll send you a reset code to recover your account
              </Typography>
            </Box>

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

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              onClick={handleNext}
              endIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                },
              }}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Enter verification code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your email for the 6-digit reset code
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Reset Code"
              value={formData.resetCode}
              onChange={handleInputChange("resetCode")}
              error={!!errors.resetCode}
              helperText={errors.resetCode}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.5rem",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ flex: 1, borderRadius: 2 }}
              >
                Back
              </Button>
              <LoadingButton
                variant="contained"
                loading={loading}
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  flex: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </LoadingButton>
            </Stack>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Create new password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a strong password for your account
              </Typography>
            </Box>

            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={formData.newPassword}
              onChange={handleInputChange("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
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
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ flex: 1, borderRadius: 2 }}
              >
                Back
              </Button>
              <LoadingButton
                variant="contained"
                loading={loading}
                onClick={handleNext}
                endIcon={<LockResetIcon />}
                sx={{
                  flex: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </LoadingButton>
            </Stack>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight={600} textAlign="center">
              Password Reset Complete!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Your password has been successfully reset. You can now sign in
              with your new password.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              size="large"
              component={Link}
              to="/auth/sign-in"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #388E3C 0%, #689F38 100%)",
                },
              }}
            >
              Sign In Now
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };

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

      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Slide direction="up" in timeout={600}>
          <Card
            elevation={24}
            sx={{
              width: "100%",
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
                <LockResetIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Reset Password
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {step < 3
                  ? "Recover access to your account"
                  : "Password successfully reset"}
              </Typography>
            </Box>

            {/* Progress Stepper */}
            {step < 3 && (
              <Box sx={{ p: 3, pb: 0 }}>
                <Stepper activeStep={step} alternativeLabel>
                  {steps.slice(0, 3).map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}

            {/* Form Content */}
            <Box sx={{ p: 4 }}>
              {errors.general && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <Fade in key={step} timeout={500}>
                <Box>{renderStepContent()}</Box>
              </Fade>

              {/* Back to Sign In */}
              {step !== 3 && (
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Button
                    component={Link}
                    to="/auth/sign-in"
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
}
