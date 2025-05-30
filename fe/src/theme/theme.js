// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2E7D32" },          // xanh lá: nút Add-to-Cart
    secondary: { main: "#1976d2" },        // xanh dương: badge, chip
  },
  shape: { borderRadius: 12 },             // bo góc 12 px cho Card, Button…
  spacing: 8,                              // quy tắc 8-px spacing mặc định
  components: {
    MuiCard: { styleOverrides: { root: { transition: "box-shadow .25s" } } },
    MuiCardActionArea: { styleOverrides: { root: { height: "100%" } } },
  },
});

export default theme;
