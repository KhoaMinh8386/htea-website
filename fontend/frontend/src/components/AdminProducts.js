import React, { useState, useEffect } from "react";

const AdminAddProduct = () => {
  const [products, setProducts] = useState([]); // Mặc định là một mảng rỗng
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    fetch("http://localhost:5000/api/product")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Dữ liệu không phải là mảng");
        }
      })
      .catch((err) => console.error("Lỗi khi lấy sản phẩm:", err));
  }, []);

  // Hàm thêm sản phẩm
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Vui lòng nhập tên và giá sản phẩm!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi thêm sản phẩm");
      }

      // Cập nhật danh sách sản phẩm sau khi thêm
      setProducts([...products, data.product]);
      setNewProduct({ name: "", price: "" });

      alert("Thêm sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
    }
  };

  // Hàm xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/product/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Lỗi khi xóa sản phẩm");
      }

      // Cập nhật lại danh sách sản phẩm sau khi xóa
      setProducts(products.filter((product) => product.id !== id));

      alert("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  return (
    <div>
      <h2>📋 Danh sách sản phẩm</h2>
      {products.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <ul>
          {Array.isArray(products) &&
            products.map((product) => (
              <li key={product.id}>
                {product.name} - {product.price} VND
                <button onClick={() => handleDeleteProduct(product.id)}>Xóa</button>
              </li>
            ))}
        </ul>
      )}

      <h3>➕ Thêm sản phẩm mới</h3>
      <input
        type="text"
        placeholder="Tên sản phẩm"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Giá"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
      />
      <button onClick={handleAddProduct}>Thêm</button>
    </div>
  );
};

export default AdminAddProduct;
