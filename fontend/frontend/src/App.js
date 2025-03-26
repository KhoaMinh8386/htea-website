import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import CheckoutPage from "./components/CheckoutPage";
import OrderList from "./components/OrderList";
import OrderPage from "./components/OrderPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./pages/Profile";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard"; // ⚡ Import Dashboard
import Dashboard from "./components/Dashboard";
const AppRoutes = () => {
  const { user } = useContext(AuthContext); // ✅ Lấy user từ AuthContext
  const location = useLocation(); // ⚡ Lấy vị trí hiện tại

  return (
    <>
      {/* Ẩn Navbar khi vào trang admin-dashboard */}
      {location.pathname !== "/admin-dashboard" && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/donhang" element={<OrderList />} />
        <Route path="/dathang" element={<OrderPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admintest" element={<AdminDashboard />} />
        <Route path="/admin" element={<Dashboard />} />
       
        {/* 🛑 Kiểm tra quyền admin trước khi vào dashboard */}
        
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
