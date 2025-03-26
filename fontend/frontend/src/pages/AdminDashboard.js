import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/AdminSidebar";
import AdminOrders from "../components/AdminOrders";
import AdminProducts from "../components/AdminProducts";
import AdminStats from "../components/AdminStats";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("stats");
  const { user, logout } = useAuth();

  // ✅ Kiểm tra quyền admin
  const isAdmin = user && user.role === "admin";

  return (
    <div style={{ display: "flex", height: "100vh", opacity: isAdmin ? 1 : 0.5 }}>
      <AdminSidebar setSelectedTab={isAdmin ? setSelectedTab : () => {}} />
      <div style={{ flex: 1, padding: "20px" }}>
        {selectedTab === "stats" && <AdminStats />}
        {selectedTab === "orders" && <AdminOrders />}
        {selectedTab === "products" && <AdminProducts />}

        {/* ✅ Hiển thị thông báo nếu không phải admin */}
        {!isAdmin && (
          <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
            Bạn không có quyền thực hiện thao tác này.
          </p>
        )}

        {/* ✅ Nút đăng xuất luôn hoạt động */}
        <button onClick={logout} style={logoutButtonStyle}>Đăng xuất</button>
      </div>
    </div>
  );
};

const logoutButtonStyle = {
  marginTop: "20px",
  padding: "10px",
  backgroundColor: "red",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};

export default AdminDashboard;
