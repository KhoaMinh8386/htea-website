import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { loading, orderError, success } = useSelector((state) => state.orders);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone: '',
    shipping_address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
    }
  }, [user, navigate]);

  // Xử lý khi đặt hàng thành công
  useEffect(() => {
    if (success) {
      dispatch(clearCart());
      toast.success('Đặt hàng thành công!');
      navigate('/orders');
    }
  }, [success, dispatch, navigate]);

  // Xử lý lỗi
  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
    }
  }, [orderError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Hàm kiểm tra kết nối server
  const checkServerConnection = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/products`);
    } catch (error) {
      console.error('Server connection error:', error);
      throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.customer_name || !formData.customer_email || !formData.phone || !formData.shipping_address) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email)) {
        throw new Error('Email không hợp lệ');
      }

      // Validate phone format
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Số điện thoại không hợp lệ');
      }

      // Format cart items for API
      const formattedItems = cartItems.map(item => {
        if (!item.id || !item.quantity || !item.price) {
          throw new Error('Thông tin sản phẩm không hợp lệ');
        }
        return {
          product_id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        };
      });

      // Calculate total amount
      const calculatedTotal = formattedItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // Prepare order data
      const orderData = {
        items: formattedItems,
        shipping_address: formData.shipping_address,
        phone: formData.phone,
        total_amount: calculatedTotal,
        notes: formData.notes || '',
        customer_name: formData.customer_name,
        customer_email: formData.customer_email
      };

      console.log("Order Data to be sent:", orderData);

      // Check server connection before submitting
      await checkServerConnection();

      // Submit order
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      if (result.success) {
        toast.success('Đặt hàng thành công!');
        navigate('/order-success');
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(error.message || 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-4">
            Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-800 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Thanh toán</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Thông tin giao hàng
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer_email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="customer_email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ghi chú
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Đơn hàng của bạn
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x {new Intl.NumberFormat('vi-VN', {
                        style: 'decimal',
                        maximumFractionDigits: 0
                      }).format(item.price)}đ
                    </p>
                  </div>
                  <p className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'decimal',
                      maximumFractionDigits: 0
                    }).format(item.price * item.quantity)}đ
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'decimal',
                      maximumFractionDigits: 0
                    }).format(calculateTotal())}đ
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <span className="text-lg font-bold">Tổng cộng</span>
                  <span className="text-lg font-bold text-green-800">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'decimal',
                      maximumFractionDigits: 0
                    }).format(calculateTotal())}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 