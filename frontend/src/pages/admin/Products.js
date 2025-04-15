import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  fetchCategories
} from '../../store/slices/productSlice';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector((state) => state.products);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const response = await dispatch(uploadImage(selectedImage)).unwrap();
      if (response.success) {
        return response.url;
      } else {
        toast.error(response.message || 'Lỗi khi tải ảnh lên');
        return null;
      }
    } catch (error) {
      toast.error(error || 'Lỗi khi tải ảnh lên');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image_url;
      
      // Nếu có ảnh mới được chọn, tải lên
      if (selectedImage) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) return;
      }
      
      const productData = {
        ...formData,
        image_url: imageUrl,
        price: parseFloat(formData.price)
      };

      if (selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct.id, productData })).unwrap();
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success('Thêm sản phẩm thành công!');
      }

      setShowModal(false);
      resetForm();
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url,
      is_available: product.is_available
    });
    setImagePreview(product.image_url);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success('Xóa sản phẩm thành công!');
        dispatch(fetchProducts());
      } catch (error) {
        toast.error(error || 'Có lỗi xảy ra khi xóa sản phẩm!');
      }
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/placeholder.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">Hình ảnh</th>
              <th className="px-6 py-3 border-b">Tên sản phẩm</th>
              <th className="px-6 py-3 border-b">Giá</th>
              <th className="px-6 py-3 border-b">Danh mục</th>
              <th className="px-6 py-3 border-b">Trạng thái</th>
              <th className="px-6 py-3 border-b">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 border-b">
                  <img 
                    src={getImageUrl(product.image_url)} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      console.log('Image load error:', product.image_url);
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </td>
                <td className="px-6 py-4 border-b">{product.name}</td>
                <td className="px-6 py-4 border-b">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)}
                </td>
                <td className="px-6 py-4 border-b">
                  {categories.find(c => c.id === product.category_id)?.name || 'Chưa phân loại'}
                </td>
                <td className="px-6 py-4 border-b">
                  <span className={`px-2 py-1 rounded ${
                    product.is_available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {product.is_available ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Giá</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Không có danh mục nào</option>
                  )}
                </select>
                {(!categories || categories.length === 0) && (
                  <p className="text-red-500 text-sm mt-1">Vui lòng thêm danh mục trước khi thêm sản phẩm</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Hình ảnh sản phẩm
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Hoặc nhập URL hình ảnh (http://... hoặc tên file)"
                  className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formData.image_url && !imagePreview && (
                  <img
                    src={getImageUrl(formData.image_url)}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      console.log('URL image load error:', formData.image_url);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="mr-2"
                  />
                  Còn hàng
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {selectedProduct ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts; 