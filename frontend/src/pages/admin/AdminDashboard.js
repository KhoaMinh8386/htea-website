import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_products: 0
  });
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/orders/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển</h1>
          <p className="text-gray-600 mt-2">Tổng quan về hoạt động của cửa hàng</p>
        </div>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tổng đơn hàng */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total_orders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tổng doanh thu */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.total_revenue.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tổng sản phẩm */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total_products}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Các chức năng quản lý */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý sản phẩm</h2>
            <p className="text-gray-600 mb-4">Thêm, sửa, xóa sản phẩm trong cửa hàng</p>
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Quản lý sản phẩm
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quản lý đơn hàng</h2>
            <p className="text-gray-600 mb-4">Xem và cập nhật trạng thái đơn hàng</p>
            <button
              onClick={() => navigate('/admin/orders')}
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Quản lý đơn hàng
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Báo cáo doanh thu</h2>
            <p className="text-gray-600 mb-4">Xem báo cáo doanh thu và thống kê</p>
            <button
              onClick={() => navigate('/admin/reports')}
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
            >
              Xem báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 