// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import App from "./App";
import "./index.css";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./mui-dashboard/scr/assets/theme";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </ThemeProvider>
);
