// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
// Nếu bạn muốn decode JWT client-side
import {jwtDecode} from "jwt-decode";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { toast } from "react-toastify";
import { login } from "../services/api";
import "../assets/styles/custom.css"; // <--- import custom CSS

const Login = ({ language, setLanguage }) => {
  const { login: authLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });

  // Load saved username if 'rememberMe'
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

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

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "", password: "" };
    if (!username.trim()) {
      newErrors.username =
        language === "vi" ? "Vui lòng nhập tên đăng nhập" : "Username is required";
      isValid = false;
    }
    if (!password.trim()) {
      newErrors.password =
        language === "vi" ? "Vui lòng nhập mật khẩu" : "Password is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await login({ username, password });
      const token = response.data.token;
      // decode
      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);
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
      if (err.message === "User does not have valid privileges") {
        toast.error(
          language === "vi"
            ? "Bạn không có quyền truy cập."
            : "You do not have access.",
          { position: "top-right", autoClose: 3000 }
        );
      } else {
        toast.error(
          language === "vi" ? "Tên đăng nhập hoặc mật khẩu không đúng" : "Invalid username or password",
          { position: "top-right", autoClose: 3000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

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
          className="fade-in-up"
        >
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
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ddd" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

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
                  <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            autoComplete="current-password"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#ddd" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
            }}
          />

          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, mb: 3 }}
          >
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
              title={language === "vi" ? "Tính năng đang phát triển" : "Feature under development"}
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

          <Button
            className="btn-primary fade-in-up"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: "bold", borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (language === "vi" ? "Đăng Nhập" : "Login")}
          </Button>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
