import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Đặt hàng thành công
        </h2>
        <p className="text-gray-600 mb-8">
          Cảm ơn quý khách đã tin tưởng và ủng hộ chúng tôi
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-green-800 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300"
        >
          Trở về trang chủ
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess; 