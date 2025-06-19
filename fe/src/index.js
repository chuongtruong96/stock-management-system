// src/index.js
import "./i18n";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { QueryProvider } from "./providers/QueryProvider";
import { MaterialUIControllerProvider } from "context";
import { AuthProvider } from "context/AuthContext";
import WsProvider from "context/WsContext";
import { NotificationProvider } from "context/NotificationContext";
import { CartProvider } from "context/CartContext/CartProvider";
import { OrderWindowProvider } from "context/OrderWindowContext";

import App from "./App";
import Loading from "components/common/Loading";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <QueryProvider>
    <MaterialUIControllerProvider>
      <BrowserRouter>
        <WsProvider>
          <AuthProvider>
            <OrderWindowProvider>
              <NotificationProvider>
                <Suspense fallback={<Loading />}>
                  <CartProvider>
                    <App />
                  </CartProvider>
                </Suspense>
              </NotificationProvider>
            </OrderWindowProvider>
          </AuthProvider>
        </WsProvider>
      </BrowserRouter>
    </MaterialUIControllerProvider>
  </QueryProvider>
);
