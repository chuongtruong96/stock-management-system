import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import WsProvider  from "./context/WsContext"; // WebSocket Provider

// ThemeProvider của Material-UI
import { ThemeProvider, CssBaseline } from "@mui/material";

// Context cấp toàn cục của template
import { MaterialUIControllerProvider } from "./context";

// Chọn theme light/dark từ template
import theme from "./assets/theme";

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <MaterialUIControllerProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <WsProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </WsProvider>
        </BrowserRouter>
      </ThemeProvider>
    </MaterialUIControllerProvider>
);
