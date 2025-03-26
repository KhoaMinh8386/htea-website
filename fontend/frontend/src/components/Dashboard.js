import React, { useState } from 'react';

function AdminDashboard() {
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dữ liệu mẫu
  const recentOrders = [
    { id: '#1342', customer: 'Nguyễn Văn A', date: '14/03/2025', status: 'Đã giao', amount: '1,200,000 đ' },
    { id: '#1341', customer: 'Trần Thị B', date: '13/03/2025', status: 'Đang giao', amount: '850,000 đ' },
    { id: '#1340', customer: 'Lê Văn C', date: '12/03/2025', status: 'Chờ xác nhận', amount: '2,400,000 đ' },
    { id: '#1339', customer: 'Phạm Thị D', date: '11/03/2025', status: 'Đã giao', amount: '750,000 đ' },
  ];

  const statistics = [
    { title: 'Tổng doanh thu', value: '37.5M đ', change: '+12%', icon: '📈' },
    { title: 'Đơn hàng mới', value: '124', change: '+8%', icon: '📦' },
    { title: 'Người dùng mới', value: '45', change: '+5%', icon: '👥' },
    { title: 'Tỷ lệ hoàn thành', value: '92%', change: '+2%', icon: '✅' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-indigo-800 text-white ${activeSidebar ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          {activeSidebar && <h1 className="text-xl font-bold">AdminPanel</h1>}
          <button 
            onClick={() => setActiveSidebar(!activeSidebar)}
            className="p-2 rounded hover:bg-indigo-700"
          >
            {activeSidebar ? '←' : '→'}
          </button>
        </div>
        
        <nav className="mt-6">
          <div 
            className={`flex items-center p-4 ${activeTab === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} cursor-pointer`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="text-lg mr-3">📊</span>
            {activeSidebar && <span>Dashboard</span>}
          </div>
          <div 
            className={`flex items-center p-4 ${activeTab === 'users' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} cursor-pointer`}
            onClick={() => setActiveTab('users')}
          >
            <span className="text-lg mr-3">👥</span>
            {activeSidebar && <span>Người dùng</span>}
          </div>
          <div 
            className={`flex items-center p-4 ${activeTab === 'products' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} cursor-pointer`}
            onClick={() => setActiveTab('products')}
          >
            <span className="text-lg mr-3">🛍️</span>
            {activeSidebar && <span>Sản phẩm</span>}
          </div>
          <div 
            className={`flex items-center p-4 ${activeTab === 'orders' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} cursor-pointer`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="text-lg mr-3">📦</span>
            {activeSidebar && <span>Đơn hàng</span>}
          </div>
          <div 
            className={`flex items-center p-4 ${activeTab === 'settings' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} cursor-pointer`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="text-lg mr-3">⚙️</span>
            {activeSidebar && <span>Cài đặt</span>}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'users' && 'Quản lý người dùng'}
              {activeTab === 'products' && 'Quản lý sản phẩm'}
              {activeTab === 'orders' && 'Quản lý đơn hàng'}
              {activeTab === 'settings' && 'Cài đặt hệ thống'}
            </h2>
            <div className="flex items-center">
              <div className="relative mr-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5">🔍</span>
              </div>
              <div className="relative mr-4">
                <span className="relative cursor-pointer">
                  🔔
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
                </span>
              </div>
              <div className="flex items-center cursor-pointer">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white mr-2">
                  A
                </div>
                <span className="text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="p-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {statistics.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-gray-500">{stat.title}</h3>
                      <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                      <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change} so với tháng trước
                      </p>
                    </div>
                    <div className="text-4xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
                <div className="h-64 flex items-end space-x-2">
                  {[65, 40, 80, 90, 50, 75, 85, 60, 70, 95, 75, 60].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        style={{height: `${height}%`}} 
                        className="w-full bg-indigo-500 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      ></div>
                      <div className="text-xs mt-1">{['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'][index]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Phân loại sản phẩm</h3>
                <div className="flex items-center justify-center h-64">
                  {/* Simulated pie chart */}
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 rounded-full border-8 border-indigo-500" style={{clipPath: 'polygon(50% 50%, 0 0, 0 100%, 100% 100%, 100% 0)'}}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-blue-400" style={{clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)'}}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-green-400" style={{clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)'}}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-yellow-400" style={{clipPath: 'polygon(50% 50%, 50% 100%, 0 100%)'}}></div>
                  </div>
                  <div className="ml-6">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-indigo-500 mr-2"></div>
                      <span>Điện tử (40%)</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-400 mr-2"></div>
                      <span>Thời trang (20%)</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-400 mr-2"></div>
                      <span>Đồ gia dụng (25%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 mr-2"></div>
                      <span>Khác (15%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
                <button className="text-indigo-600 hover:text-indigo-800">Xem tất cả</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'Đã giao' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Đang giao' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Chi tiết</button>
                          <button className="text-gray-600 hover:text-gray-900">Sửa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'dashboard' && (
          <div className="p-6 flex items-center justify-center h-64 bg-gray-50 rounded-lg mt-6 mx-6">
            <p className="text-gray-500 text-lg">Nội dung cho trang {activeTab} đang được phát triển</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;