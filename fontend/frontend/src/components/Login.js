import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext); // 🟢 Dùng login thay vì setUser
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      login({ username: data.username, token: data.token }); // 🟢 Sử dụng login() thay vì setUser()
      localStorage.setItem("token", data.token); // Lưu token vào localStorage
      navigate("/"); // Chuyển về trang chính sau khi đăng nhập thành công
    } else {
      setError(data.error || "Sai tên đăng nhập hoặc mật khẩu!");
    }
  };

  return (
    <div>
      <h2>🔑 Đăng Nhập</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <label>Tên đăng nhập:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Mật khẩu:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">✅ Đăng Nhập</button>
      </form>
      <p>Chưa có tài khoản? <a href="/register">Đăng ký</a></p>
    </div>
  );
};

export default Login;
