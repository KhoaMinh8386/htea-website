import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedProduct, loading, error } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate('/products');
    }
  }, [error, navigate]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...selectedProduct, quantity }));
    toast.success('Đã thêm sản phẩm vào giỏ hàng');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (!selectedProduct) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
          </div>
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            {selectedProduct.name}
          </h1>
          <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
          <div className="mb-6">
            <span className="text-2xl font-bold text-green-800">
              {selectedProduct.price ? new Intl.NumberFormat('vi-VN', {
                style: 'decimal',
                maximumFractionDigits: 0
              }).format(selectedProduct.price) : '0'}đ
            </span>
          </div>
          <div className="mb-6">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số lượng
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 text-center border-t border-b border-gray-300 py-1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-500"
            >
              Xem giỏ hàng
            </button>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Thông tin sản phẩm
            </h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600">
                <span className="font-medium">Danh mục:</span>{' '}
                {selectedProduct.categoryInfo?.name || 'Chưa phân loại'}
              </p>
              {selectedProduct.is_available ? (
                <p className="text-green-600">
                  <span className="font-medium">Tình trạng:</span> Còn hàng
                </p>
              ) : (
                <p className="text-red-600">
                  <span className="font-medium">Tình trạng:</span> Hết hàng
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 