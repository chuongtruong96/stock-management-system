/*  src/pages/Login.jsx  */
import { useState, useContext } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  login as apiLogin,
  forgotPassword as apiForgot,     // ⬅ you’ll add this in api.js
} from "../services/api";

const Login = ({ language, setLanguage }) => {
  const { login: authLogin } = useContext(AuthContext);
  const navigate              = useNavigate();

  /* ---------------- state ---------------- */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  /* forgot‑pw dialog */
  const [openForgot, setOpenForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");

  /* ---------------- helpers ---------------- */
  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Required";
    if (!password.trim()) e.password = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await apiLogin({ username, password });
      const token    = data.token;
      const decoded  = jwtDecode(token);

      authLogin({
        token,
        username,
        roles: decoded.role ? [decoded.role] : decoded.roles,
      });
      toast.success("Logged in");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- forgot password ---------- */
  const handleForgot = async () => {
    if (!fpEmail.trim()) {
      toast.error("Enter e‑mail");
      return;
    }
    try {
      await apiForgot({ email: fpEmail });
      toast.success("Check your inbox for a reset link");
      setOpenForgot(false);
      setFpEmail("");
    } catch (err) {
      toast.error(err.response?.data || "Request failed");
    }
  };

  /* ---------------- render ---------------- */
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "linear-gradient(135deg,#6e8efb,#a777e3)",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 420,
          bgcolor: "#fff",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Stationery Management
        </Typography>

        {/* username */}
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          error={!!errors.username}
          helperText={errors.username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />

        {/* password */}
        <TextField
          label="Password"
          type={showPw ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          error={!!errors.password}
          helperText={errors.password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw((p) => !p)} edge="end">
                  {showPw ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  localStorage.setItem("rememberMe", e.target.checked);
                }}
              />
            }
            label="Remember me"
          />

          <Link
            component="button"
            underline="hover"
            onClick={() => setOpenForgot(true)}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? <CircularProgress size={22} /> : "Login"}
        </Button>
      </Box>

      {/* ------------- Forgot‑pw dialog ------------- */}
      <Dialog open={openForgot} onClose={() => setOpenForgot(false)}>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <TextField
            label="Department e‑mail"
            fullWidth
            margin="dense"
            value={fpEmail}
            onChange={(e) => setFpEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForgot(false)}>Cancel</Button>
          <Button onClick={handleForgot} variant="contained">
            Send link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
