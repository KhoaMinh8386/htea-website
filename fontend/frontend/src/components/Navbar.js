import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css"; // ✅ Để làm đẹp

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔥 Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">🍵 Htea</Link>
      </div>

      {/* 🔹 Nếu user đã đăng nhập, hiển thị username và dropdown */}
      {user ? (
        <div className="user-menu">
          <span className="user-name" onClick={() => setShowDropdown(!showDropdown)}>
            👤 {user.username} ▼
          </span>

          {/* 🔥 Dropdown menu */}
          {showDropdown && (
            <div className="dropdown">
              <Link to="/profile">📄 Hồ sơ</Link>
              <button onClick={handleLogout}>🚪 Đăng xuất</button>
            </div>
          )}
        </div>
      ) : (
        // Nếu chưa đăng nhập, hiển thị nút Login
        <Link to="/login" className="login-btn">🔑 Đăng nhập</Link>
      )}
    </nav>
  );
};

export default Navbar;
