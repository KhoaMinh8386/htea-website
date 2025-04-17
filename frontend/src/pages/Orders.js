import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Có lỗi xảy ra khi tải danh sách đơn hàng.</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-4">
            Bạn chưa có đơn hàng nào trong hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Đơn hàng của tôi</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Đơn hàng #{order.id}
                  </h3>
                  <p className="text-gray-600">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: vi,
                    })}
                  </p>
                </div>
                <span
                  className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="border-t border-b py-4 my-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Thông tin giao hàng</h4>
                    <p className="text-gray-600">{order.customer_name}</p>
                    <p className="text-gray-600">{order.phone}</p>
                    <p className="text-gray-600">{order.shipping_address}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Chi tiết đơn hàng</h4>
                    <p className="text-gray-600">
                      Email: {order.customer_email}
                    </p>
                    {order.notes && (
                      <p className="text-gray-600">Ghi chú: {order.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
                      <div className="ml-4">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Tổng tiền hàng</p>
                  <p className="text-lg font-bold text-green-800">
                    {order.total_amount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                {order.status === 'pending' && (
                  <button
                    onClick={() => {
                      // Handle cancel order
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 