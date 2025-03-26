import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login"); // Chuyển hướng sau khi đăng ký thành công
    } else {
      setError(data.error || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div>
      <h2>Đăng Ký</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <label>Tên đăng nhập:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        
        <label>Mật khẩu:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit">Đăng Ký</button>
      </form>
      <p>Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
    </div>
  );
};

export default Register;
