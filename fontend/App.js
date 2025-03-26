import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProductList from "./components/ProductList";
import CheckoutPage from "./components/CheckoutPage";
import OrderList from "./components/OrderList";
import OrderPage from "./components/OrderPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/donhang" element={<OrderList />} />
          <Route path="/dathang" element={<OrderPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Dashboard />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
