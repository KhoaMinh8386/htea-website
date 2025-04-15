import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueStats } from '../../store/slices/adminSlice';
import { toast } from 'react-toastify';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);
  const [dateRange, setDateRange] = useState('day');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await dispatch(
          fetchRevenueStats({
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
          })
        ).unwrap();
      } catch (error) {
        toast.error('Không thể tải dữ liệu thống kê: ' + error);
      }
    };

    fetchStats();
  }, [dispatch, startDate, endDate]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const now = new Date();
    switch (range) {
      case 'day':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case 'month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'year':
        setStartDate(startOfYear(now));
        setEndDate(endOfYear(now));
        break;
      default:
        break;
    }
  };

  const revenueData = {
    labels: stats?.revenueByDay?.map((item) =>
      format(new Date(item.date), 'dd/MM', { locale: vi })
    ) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: stats?.revenueByDay?.map((item) => item.revenue) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const orderStatusData = {
    labels: ['Chờ xử lý', 'Đang xử lý', 'Đã giao hàng', 'Đã nhận hàng', 'Đã hủy'],
    datasets: [
      {
        data: [
          stats?.orderStatusCounts?.pending || 0,
          stats?.orderStatusCounts?.processing || 0,
          stats?.orderStatusCounts?.shipped || 0,
          stats?.orderStatusCounts?.delivered || 0,
          stats?.orderStatusCounts?.cancelled || 0,
        ],
        backgroundColor: [
          'rgba(234, 179, 8, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(168, 85, 247, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
        borderColor: [
          'rgb(234, 179, 8)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topProductsData = {
    labels: stats?.topProducts?.map((product) => product.name) || [],
    datasets: [
      {
        label: 'Số lượng bán',
        data: stats?.topProducts?.map((product) => product.quantity) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleDateRangeChange('day')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'day'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => handleDateRangeChange('month')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => handleDateRangeChange('year')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'year'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Năm nay
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tổng doanh thu
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.totalRevenue?.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Số đơn hàng
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.totalOrders}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đơn hàng trung bình
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.averageOrderValue?.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Biểu đồ doanh thu
          </h3>
          <Line
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) =>
                      value.toLocaleString('vi-VN') + 'đ',
                  },
                },
              },
            }}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Trạng thái đơn hàng
          </h3>
          <Pie
            data={orderStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Sản phẩm bán chạy
        </h3>
        <Bar
          data={topProductsData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Reports; 