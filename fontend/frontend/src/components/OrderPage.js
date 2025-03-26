import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // 🛑 Kiểm tra đăng nhập

const OrderPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [message, setMessage] = useState("");

  // 🛑 Nếu chưa đăng nhập, điều hướng về trang login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 🟢 useEffect đầu tiên: Lấy danh sách sản phẩm
  useEffect(() => {
    fetch("http://localhost:5000/api/product")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi khi lấy sản phẩm:", err));
  }, []); // Chỉ gọi 1 lần khi component mount

  // 🟢 useEffect thứ hai: Lấy lịch sử đơn hàng
  useEffect(() => {
    if (user && user.id) {  // Kiểm tra điều kiện BÊN NGOÀI useEffect
      fetchOrderHistory();
    }
  }, [user]); // Dependency là `user`, hook này sẽ chạy lại khi `user` thay đổi

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders?user_id=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setOrderHistory(data);
      } else {
        setMessage("Không thể lấy danh sách đơn hàng.");
      }
    } catch (error) {
      setMessage("Lỗi kết nối đến server!");
    }
  };

  const addProduct = (event) => {
    const productId = event.target.value;
    if (!productId) return;

    const product = products.find((p) => p.id === parseInt(productId));
    if (product) {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const removeProduct = (index) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const updateQuantity = (index, newQuantity) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = newQuantity;
    setSelectedProducts(updatedProducts);
  };

  const totalPrice = selectedProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const placeOrder = () => {
    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    const orderItems = selectedProducts.map((product) => ({
      product_id: product.id,
      quantity: product.quantity,
      total_price: product.price * product.quantity,
    }));

    const orderData = {
      user_id: user.id,
      username: user.username,  // Thêm tên người dùng
      items: orderItems,
    };

    fetch("http://localhost:5000/api/orders-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Đặt hàng thành công!");
        setSelectedProducts([]);
        fetchOrderHistory();
      })
      .catch((err) => console.error("Lỗi khi đặt hàng:", err));
  };

  return (
    <div>
      <h2>🛒 Đặt Hàng</h2>
      <h3>👤 Khách hàng: {user.username || "Đang tải..."}</h3>
      <label>Chọn sản phẩm:</label>
      <select onChange={addProduct}>
        <option value="">-- Chọn sản phẩm --</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} - {product.price} VND
          </option>
        ))}
      </select>
      <h3>Sản phẩm đã chọn:</h3>
      {selectedProducts.length === 0 ? (
        <p>Chưa có sản phẩm nào.</p>
      ) : (
        <ul>
          {selectedProducts.map((product, index) => (
            <li key={index}>
              {product.name} - {product.price} VND x
              <input
                type="number"
                value={product.quantity}
                min="1"
                onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
              />
              <button onClick={() => removeProduct(index)}>❌ Xóa</button>
            </li>
          ))}
        </ul>
      )}
      <h3>💰 Tổng tiền: {totalPrice} VND</h3>
      <button onClick={placeOrder}>✅ Đặt Hàng</button>
      <h2>📜 Lịch Sử Đơn Hàng</h2>
      <ul>
        {orderHistory.length > 0 ? (
          orderHistory.map((order) => (
            <li key={order.id}>
              Mã đơn: {order.id} | Sản phẩm: {order.items ? order.items.map(item => item.name).join(", ") : "Không có sản phẩm"} | Số lượng: {order.quantity} | Tổng tiền: {order.total_price} VNĐ
            </li>
          ))
        ) : (
          <p>Chưa có đơn hàng nào.</p>
        )}
      </ul>
    </div>
  );
};

export default OrderPage;
