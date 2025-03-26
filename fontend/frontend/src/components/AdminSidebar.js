import React from "react";

const AdminSidebar = ({ setSelectedTab }) => {
  return (
    <div style={sidebarStyle}>
      <h2>Quản lý</h2>
      <button onClick={() => setSelectedTab("stats")} style={buttonStyle}>📊 Thống kê</button>
      <button onClick={() => setSelectedTab("orders")} style={buttonStyle}>📦 Đơn hàng</button>
      <button onClick={() => setSelectedTab("products")} style={buttonStyle}>🛍 Sản phẩm</button>
    </div>
  );
};

const sidebarStyle = {
  width: "250px",
  height: "100vh",
  background: "#2c3e50",
  color: "white",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
};

const buttonStyle = {
  padding: "10px",
  background: "transparent",
  color: "white",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "16px",
  margin: "10px 0",
};

export default AdminSidebar;
