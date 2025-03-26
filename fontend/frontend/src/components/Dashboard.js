import React, { useState } from 'react';
import AdminProducts from './AdminProducts';

function AdminDashboard() {
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dữ liệu mẫu
  const statistics = [
    { title: 'Tổng doanh thu', value: '37.5M đ', change: '+12%', icon: '📈' },
    { title: 'Đơn hàng mới', value: '124', change: '+8%', icon: '📦' },
    { title: 'Người dùng mới', value: '45', change: '+5%', icon: '👥' },
    { title: 'Tỷ lệ hoàn thành', value: '92%', change: '+2%', icon: '✅' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-indigo-800 text-white ${activeSidebar ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          {activeSidebar && <h1 className="text-xl font-bold">AdminPanel</h1>}
          <button onClick={() => setActiveSidebar(!activeSidebar)} className="p-2 rounded hover:bg-indigo-700">
            {activeSidebar ? '←' : '→'}
          </button>
        </div>
        <nav className="mt-6">
          {['dashboard', 'users', 'products', 'orders', 'settings'].map((tab) => (
            <div
              key={tab}
              className={`flex items-center p-4 ${activeTab === tab ? 'bg-indigo-700' : 'hover:bg-indigo-700'} cursor-pointer`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="text-lg mr-3">{tab === 'dashboard' ? '📊' : tab === 'users' ? '👥' : tab === 'products' ? '🛍️' : tab === 'orders' ? '📦' : '⚙️'}</span>
              {activeSidebar && <span>{tab === 'dashboard' ? 'Dashboard' : tab === 'users' ? 'Người dùng' : tab === 'products' ? 'Sản phẩm' : tab === 'orders' ? 'Đơn hàng' : 'Cài đặt'}</span>}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === 'dashboard' && 'Dashboard'}
          {activeTab === 'users' && 'Quản lý người dùng'}
          {activeTab === 'products' && 'Quản lý sản phẩm'}
          {activeTab === 'orders' && 'Quản lý đơn hàng'}
          {activeTab === 'settings' && 'Cài đặt hệ thống'}
        </h2>

        {/* Nội dung theo tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-gray-500">{stat.title}</h3>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && <AdminProducts />}
      </div>
    </div>
  );
}

export default AdminDashboard;