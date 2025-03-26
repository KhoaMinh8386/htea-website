import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate(); // ⚡ Hook điều hướng

  return (
    <div style={styles.container}>
      <h1>🍵 Chào mừng đến với Htea!</h1>
      <p>Thưởng thức những ly trà thơm ngon và tinh tế nhất.</p>

      {/* 🔹 Nút "Xem Sản Phẩm" dẫn đến trang ProductList */}
      <button style={styles.button} onClick={() => navigate("/products")}>
        🛍 Xem Sản Phẩm
      </button>
    </div>
  );
};

// 🎨 CSS styles
const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
  },
  button: {
    marginTop: "20px",
    padding: "12px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default HomePage;
