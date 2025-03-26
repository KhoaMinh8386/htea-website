import React, { useState, useEffect } from "react";

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
  });

  useEffect(() => {
    // 🔥 Gọi API lấy dữ liệu thống kê
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error("Lỗi khi lấy dữ liệu thống kê:", error));
  }, []);

  return (
    <div>
      <h2>📊 Thống kê Doanh số</h2>
      <p>💰 Tổng doanh thu: {stats.totalRevenue.toLocaleString()} VND</p>
      <p>📦 Tổng số đơn hàng: {stats.totalOrders}</p>
      <p>🛍 Số sản phẩm đã bán: {stats.totalProductsSold}</p>
    </div>
  );
};

export default AdminStats;
