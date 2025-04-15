import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  DatePicker,
  List,
  Tag
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        axios.get('/api/dashboard/stats', {
          params: {
            start_date: dateRange[0].format('YYYY-MM-DD'),
            end_date: dateRange[1].format('YYYY-MM-DD')
          }
        }),
        axios.get('/api/dashboard/activities')
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const revenueData = stats?.revenue_stats.map(item => ({
    date: moment(item.date).format('DD/MM'),
    value: item.daily_revenue
  })) || [];

  const config = {
    data: revenueData,
    xField: 'date',
    yField: 'value',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ marginBottom: 16 }}
          />
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats?.order_stats.total_orders}
              prefix={<ShoppingCartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats?.order_stats.total_revenue}
              prefix={<DollarOutlined />}
              formatter={value => `${value.toLocaleString('vi-VN')}đ`}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats?.product_stats.total_products}
              prefix={<ShoppingOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={stats?.user_stats.total_users}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Doanh thu theo ngày">
            <Line {...config} />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Sản phẩm bán chạy">
            <List
              dataSource={stats?.top_products}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={`Đã bán: ${item.total_quantity} sản phẩm`}
                  />
                  <div>{item.total_revenue.toLocaleString('vi-VN')}đ</div>
                </List.Item>
              )}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Hoạt động gần đây">
            <List
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.user.username} - ${item.action}`}
                    description={moment(item.created_at).format('DD/MM/YYYY HH:mm')}
                  />
                  <Tag color="blue">{item.table_name}</Tag>
                </List.Item>
              )}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 