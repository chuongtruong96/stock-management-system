import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login } from "../services/api";

const Login = ({ language, setLanguage }) => {
  const { login: authLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  // Load "Remember Me" state and username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Handle "Remember Me" checkbox change
  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    if (isChecked) {
      localStorage.setItem("rememberedUsername", username);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedUsername");
      localStorage.setItem("rememberMe", "false");
    }
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "", password: "" };

    if (!username.trim()) {
      newErrors.username = language === "vi" ? "Vui lòng nhập tên đăng nhập" : "Username is required";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = language === "vi" ? "Vui lòng nhập mật khẩu" : "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await login({ username, password });
      const token = response.data.token;
      const decoded = jwtDecode(token);
      console.log('Decoded JWT:', decoded); // Debug: Inspect token structure
      const user = {
        token,
        username,
        roles: decoded.role ? [decoded.role] : decoded.roles || [],
      };
      authLogin(user);
      toast.success(language === "vi" ? "Đăng nhập thành công!" : "Login successful!", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      if (err.message === 'User does not have valid privileges') {
        toast.error(
          language === "vi"
            ? "Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên."
            : "You do not have access. Please contact an administrator.",
          { position: "top-right", autoClose: 3000 }
        );
      } else {
        toast.error(
          language === "vi"
            ? "Tên đăng nhập hoặc mật khẩu không đúng"
            : "Invalid username or password",
          { position: "top-right", autoClose: 3000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6e8efb, #a777e3)",
        animation: "gradient 15s ease infinite",
        backgroundSize: "400% 400%",
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <Fade in timeout={1000}>
        <Box
          sx={{
            width: { xs: "90%", sm: 450 },
            p: { xs: 3, sm: 4 },
            backgroundColor: "white",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            position: "relative",
          }}
        >
          {/* App Logo/Name */}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
              mb: 4,
              fontSize: { xs: "1.8rem", sm: "2.2rem" },
            }}
          >
            {language === "vi" ? "Đăng Nhập Hệ Thống" : "Stationery Management"}
          </Typography>

          {/* Language Toggle */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: "#666" }}>
              {language === "vi" ? "Ngôn Ngữ" : "Language"}
            </InputLabel>
            <Select
              value={language}
              onChange={handleLanguageChange}
              label={language === "vi" ? "Ngôn Ngữ" : "Language"}
              sx={{
                "& .MuiSelect-select": { py: 1.5 },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="vi">Tiếng Việt</MenuItem>
            </Select>
          </FormControl>

          {/* Username Field */}
          <TextField
            label={language === "vi" ? "Tên Đăng Nhập" : "Username"}
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            autoComplete="username"
            autoFocus
            sx={{
              "& .MuiInputLabel-root": { color: "#666" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ddd" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
            inputProps={{ "aria-label": language === "vi" ? "Tên Đăng Nhập" : "Username" }}
          />

          {/* Password Field */}
          <TextField
            label={language === "vi" ? "Mật Khẩu" : "Password"}
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    aria-label={
                      language === "vi"
                        ? showPassword
                          ? "Ẩn mật khẩu"
                          : "Hiện mật khẩu"
                        : showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            autoComplete="current-password"
            sx={{
              "& .MuiInputLabel-root": { color: "#666" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ddd" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
            inputProps={{ "aria-label": language === "vi" ? "Mật Khẩu" : "Password" }}
          />

          {/* Remember Me and Forgot Password */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  color="primary"
                  sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                  {language === "vi" ? "Ghi Nhớ Tôi" : "Remember Me"}
                </Typography>
              }
            />
            <Tooltip
              title={
                language === "vi"
                  ? "Tính năng đang phát triển"
                  : "Feature under development"
              }
              arrow
            >
              <span>
                <Link
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  sx={{
                    fontSize: "0.9rem",
                    color: "#1976d2",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  aria-disabled="true"
                >
                  {language === "vi" ? "Quên Mật Khẩu?" : "Forgot Password?"}
                </Link>
              </span>
            </Tooltip>
          </Box>

          {/* Login Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
                transform: "scale(1.02)",
                transition: "all 0.3s ease",
              },
              "&:disabled": {
                backgroundColor: "#b0bec5",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>{language === "vi" ? "Đăng Nhập" : "Login"}</>
            )}
          </Button>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;