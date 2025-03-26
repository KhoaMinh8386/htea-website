import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext"; // 🛑 Thêm AuthProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* 🛑 Bọc toàn bộ ứng dụng */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Để đo lường hiệu suất
reportWebVitals();
