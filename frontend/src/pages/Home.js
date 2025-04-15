import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="bg-green-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
                Khám phá thế giới trà cao cấp
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                HTEA cung cấp các loại trà cao cấp từ khắp nơi trên thế giới, 
                được chọn lọc kỹ lưỡng để mang đến cho bạn trải nghiệm thưởng thức trà tuyệt vời nhất.
              </p>
              <Link
                to="/products"
                className="bg-green-800 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300"
              >
                Xem sản phẩm
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="/images/hero-tea.jpg"
                alt="Trà cao cấp"
                className="rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAjs_UXMqODMt4B4hZgyRuSSsZSxhg9HKv_41iVz0Fv5IkRVZ0oIfFDVb15B177Vqmae4&usqp=CAU';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
            Sản phẩm nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured Product 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img
                  src="https://cacaomi.vn/wp-content/uploads/2022/12/tra-xanh-thai-nguyen-cacaomi2.jpg"
                  alt="Trà xanh"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Trà xanh Thái Nguyên</h3>
                <p className="text-gray-600 mb-4">
                  Trà xanh Thái Nguyên nổi tiếng với hương vị đặc trưng, vị chát nhẹ và hậu ngọt.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-bold">150,000đ</span>
                  <Link
                    to="/products/1"
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>

            {/* Featured Product 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img
                  src="/images/tea-2.jpg"
                  alt="Trà oolong"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTQQcJN9Vpwx9x1bWq3Xzl8QEFM17LmvciLQ&s';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Trà Oolong Sữa</h3>
                <p className="text-gray-600 mb-4">
                  Trà Oolong Sữa với hương vị đặc trưng, kết hợp giữa vị trà và hương sữa.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-bold">180,000đ</span>
                  <Link
                    to="/products/2"
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>

            {/* Featured Product 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img
                  src="https://cacaomi.vn/wp-content/uploads/2022/12/tra-xanh-thai-nguyen-cacaomi2.jpg"
                  alt="Trà đen"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Trà Đen Earl Grey</h3>
                <p className="text-gray-600 mb-4">
                  Trà Đen Earl Grey với hương bergamot đặc trưng, vị trà đậm đà.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-bold">200,000đ</span>
                  <Link
                    to="/products/3"
                    className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
            Tại sao chọn HTEA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng cao</h3>
              <p className="text-gray-600">
                Chúng tôi chỉ cung cấp những sản phẩm trà chất lượng cao, được chọn lọc kỹ lưỡng.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh chóng</h3>
              <p className="text-gray-600">
                Chúng tôi cam kết giao hàng nhanh chóng, đúng thời gian cho khách hàng.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giá cả hợp lý</h3>
              <p className="text-gray-600">
                Chúng tôi cung cấp sản phẩm chất lượng với giá cả hợp lý, phù hợp với mọi đối tượng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 