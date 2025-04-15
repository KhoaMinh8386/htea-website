import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Select,
  Tag,
  DatePicker,
  Descriptions
} from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
        search: searchText,
        status: statusFilter
      };

      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.get('/api/orders', { params });
      setOrders(response.data.orders);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: response.data.pagination.total
      });
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchText, statusFilter, dateRange]);

  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
  };

  const handleViewDetail = async (order) => {
    try {
      const response = await axios.get(`/api/orders/${order.id}`);
      setSelectedOrder(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status: newStatus
      });
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      processing: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user.full_name,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `${amount.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'processing')}
              >
                Xử lý
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'cancelled')}
              >
                Hủy
              </Button>
            </>
          )}
          {record.status === 'processing' && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'completed')}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="order-management">
      <div className="filters" style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="pending">Chờ xử lý</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 300 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title="Chi tiết đơn hàng"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered>
              <Descriptions.Item label="Mã đơn hàng">
                {selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.user.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.user.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.shipping_address}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {moment(selectedOrder.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {selectedOrder.total_amount.toLocaleString('vi-VN')}đ
              </Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={selectedOrder.items}
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'product',
                  key: 'product',
                  render: (product) => product.name,
                },
                {
                  title: 'Giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `${price.toLocaleString('vi-VN')}đ`,
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  render: (subtotal) => `${subtotal.toLocaleString('vi-VN')}đ`,
                },
              ]}
              pagination={false}
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement; 