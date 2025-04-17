import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error('Không thể tải danh sách đơn hàng: ' + error);
    }
  }, [error]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái đơn hàng: ' + error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đã giao hàng';
      case 'delivered':
        return 'Đã nhận hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const filteredOrders = orders
    .filter((order) =>
      order.id.toString().includes(searchTerm) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((order) =>
      selectedStatus === 'all' ? true : order.status === selectedStatus
    )
    .filter((order) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const orderDate = new Date(order.created_at);
      return (
        orderDate >= dateRange.startDate && orderDate <= dateRange.endDate
      );
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã giao hàng</option>
            <option value="delivered">Đã nhận hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate || ''}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: new Date(e.target.value) })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="date"
              value={dateRange.endDate || ''}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: new Date(e.target.value) })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: vi,
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.total.toLocaleString('vi-VN')}đ
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đã giao hàng</option>
                    <option value="delivered">Đã nhận hàng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details */}
      {filteredOrders.map((order) => (
        <div key={order.id} className="mt-4 p-4 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{order.id}</h2>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={order.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                alt={order.customer_name || 'Order'}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
              <div className="ml-4">
                <p className="font-medium">{order.customer_name || 'Unknown Customer'}</p>
                <p className="text-sm text-gray-600">
                  {order.customer_email || 'No email available'}
                </p>
              </div>
            </div>
            <p className="font-medium">
              {order.total.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="mt-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center"
              >
                <div className="flex items-center">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                    alt={item.product_name || 'Product'}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                  <div className="ml-4">
                    <p className="font-medium">{item.product_name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity || 0} x {(item.price || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {((item.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}đ
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders; 