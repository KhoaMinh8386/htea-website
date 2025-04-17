import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, user?.id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchOrders())}
            className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 w-full"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-gray-400 mb-6">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa có đơn hàng nào trong hệ thống.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 w-full"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mt-2">Xem và theo dõi đơn hàng của bạn</p>
        </div>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Đơn hàng #{order.id}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Ngày đặt: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-2xl font-bold text-green-800">
                      {order.total_amount.toLocaleString('vi-VN')}đ
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'pending' ? 'Chờ xử lý' :
                       order.status === 'processing' ? 'Đang xử lý' :
                       order.status === 'completed' ? 'Hoàn thành' :
                       'Đã hủy'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm</h3>
                  <div className="space-y-4">
                    {order.items && order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <p className="font-medium text-gray-800">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-800">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin giao hàng</h3>
                      <div className="space-y-2">
                        <p className="text-gray-600 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {order.shipping_address}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {order.phone}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Ghi chú</h3>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                        {order.notes || 'Không có ghi chú'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders; 