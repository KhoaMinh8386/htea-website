import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔥 Gửi token xác thực
        },
      })
      .then((response) => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("🚨 Lỗi khi lấy danh sách đơn hàng:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>⏳ Đang tải danh sách đơn hàng...</p>;

  return (
    <div>
      <h2>📦 Danh sách đơn hàng</h2>
      {orders.length === 0 ? (
        <p>❌ Không có đơn hàng nào!</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <strong>🛍 Đơn hàng #{order.id}</strong> - {order.total_price} VND ({new Date(order.created_at).toLocaleString()})
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - {item.price} VND x {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <Link to="/">🏠 Quay về Trang Chủ</Link>
    </div>
  );
};

export default OrderList;
