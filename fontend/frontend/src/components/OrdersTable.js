import React, { useEffect, useState } from "react";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders") // Gọi API lấy danh sách đơn hàng
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách đơn hàng</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Khách hàng</th>
            <th className="border px-4 py-2">Tổng tiền</th>
            <th className="border px-4 py-2">Sản phẩm</th>
            <th className="border px-4 py-2">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="border px-4 py-2">{order.id}</td>
              <td className="border px-4 py-2">{order.username}</td>
              <td className="border px-4 py-2">{order.total_price} VND</td>
              <td className="border px-4 py-2">
                {order.items.map((item) => (
                  <p key={item.name}>
                    {item.name} - {item.quantity}x ({item.price} VND)
                  </p>
                ))}
              </td>
              <td className="border px-4 py-2">
                {new Date(order.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
