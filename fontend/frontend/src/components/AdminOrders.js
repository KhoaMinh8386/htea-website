import React, { useEffect, useState } from "react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Lỗi khi lấy đơn hàng:", err));
  }, []);

  return (
    <div>
      <h2>📦 Danh sách đơn hàng</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.id} - {order.product_name} - {order.total_price} VND
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminOrders;
