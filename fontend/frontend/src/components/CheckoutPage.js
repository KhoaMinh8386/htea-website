import React, { useState } from "react";

const CheckoutPage = ({ cart }) => {
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");

  // Tính tổng tiền đơn hàng
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 🛒 Xử lý đặt hàng
  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }

    const orderData = {
      customer_name: customerName,
      total_price: totalPrice,
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Đơn hàng đã được gửi thành công!");
      } else {
        setMessage(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      setMessage("Lỗi kết nối đến server!");
    }
  };

  return (
    <div>
      <h2>🛍 Thanh Toán</h2>

      <label>
        Họ và Tên:
        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
      </label>

      <h3>Danh sách sản phẩm:</h3>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - {item.price} VNĐ x {item.quantity}
          </li>
        ))}
      </ul>

      <h3>Tổng tiền: {totalPrice} VNĐ</h3>

      <button onClick={handleCheckout}>Thanh toán</button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CheckoutPage;
