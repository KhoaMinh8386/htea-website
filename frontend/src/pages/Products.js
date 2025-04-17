import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error('Không thể tải danh sách sản phẩm: ' + error);
    }
  }, [error]);

  // Extract unique categories from products
  useEffect(() => {
    if (products) {
      const uniqueCategories = [...new Set(products.map(p => ({
        id: p.category_id,
        name: p.category_name || `Danh mục ${p.category_id}`
      })))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success('Đã thêm sản phẩm vào giỏ hàng');
  };

  // Ensure products is an array before filtering
  const productsArray = Array.isArray(products) ? products : [];
  
  const filteredProducts = productsArray
    .filter((product) =>
      selectedCategory === 'all'
        ? true
        : product.category_id.toString() === selectedCategory
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mb-4"></div>
        <p className="text-gray-600">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải sản phẩm</p>
        <button
          onClick={() => dispatch(fetchProducts())}
          className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-4 md:mb-0">
          Sản phẩm
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={`category-${category.id}-${category.name}`} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Không tìm thấy sản phẩm phù hợp.</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-green-800 hover:text-green-700 mt-2"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={product.image_url || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-bold">
                    {parseFloat(product.price).toLocaleString('vi-VN')}đ
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-300"
                    >
                      Chi tiết
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition-colors duration-300"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products; 