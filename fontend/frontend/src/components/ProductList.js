import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import OrderPage from "./OrderPage"; // ✅ Import OrderPage để quản lý đơn hàng

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // ✅ Lưu danh sách đơn hàng
  const navigate = useNavigate(); 

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/product")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Lỗi khi lấy sản phẩm:", error));
  }, []);

  // ✅ Thêm sản phẩm vào danh sách đơn hàng
  const handleAddToOrders = (product) => {
    setOrders([...orders, product]);
    navigate("/dathang"); // 🔥 Chuyển đến trang thanh toán
  };

  return (
    <div>
      <h2>🛒 Danh sách sản phẩm</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.price} VND
            <button onClick={() => handleAddToOrders(product)}>➕ Đặt hàng</button>
          </li>
        ))}
      </ul>
      <Link to="/dathang">🛍 Đi tới thanh toán</Link>
      <br />
      <Link to="/donhang">📦 Xem danh sách đơn hàng</Link>

      {/* ✅ Hiển thị danh sách đơn hàng trong OrderPage */}
      <OrderPage orders={orders} />
    </div>
  );
};

export default ProductList;
