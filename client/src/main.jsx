import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ShopProvider } from "./context/ShopContext.jsx";
import "./styles.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShopProvider>
          <App />
          <ToastContainer position="bottom-right" theme="colored" />
        </ShopProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
