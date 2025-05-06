import React, { useEffect, useState } from 'react'
import {
  WrapperContainer,
  StatCard,
  CardTitle,
  CardValue,
  RevenueChartCard,
  ChartTabs,
  ListCard,
  ListItem,
  SidebarMenu,
  ContentWrapper,
} from './style'

import { getItem } from '../../utils'
import { AppstoreOutlined, ShoppingCartOutlined, UserOutlined, PieChartOutlined } from '@ant-design/icons'
import { Menu, Row, Col, Spin, Typography, Tabs, Card, Table, Tag, Button } from 'antd'
import RevenueChart from '../../components/Charts/RevenueChart'
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent'
import AdminUser from '../../components/AdminUser/AdminUser'
import AdminProduct from '../../components/AdminProduct/AdminProduct'
import OrderAdmin from '../../components/OrderAdmin/OrderAdmin'
import { getDashboardData } from '../../service/DashboardService'

const { Title, Text } = Typography
const { TabPane } = Tabs

export const AdminPage = () => {
  const items = [
    getItem('Tổng quan', '', <PieChartOutlined />),
    getItem('Người dùng', 'user', <UserOutlined />),
    getItem('Sản phẩm', 'product', <AppstoreOutlined />),
    getItem('Đơn hàng', 'order', <ShoppingCartOutlined />),
  ]

  const [keySelected, setKeySelected] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('week')
  const [showAllOrders, setShowAllOrders] = useState(false)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const access_token = localStorage.getItem('access_token')
      const res = await getDashboardData(access_token)
      setDashboardData(res)
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleOrders = () => {
    setShowAllOrders((prev) => !prev)
  }
  

  useEffect(() => {
    if (keySelected === '') {
      fetchDashboard()
    }
  }, [keySelected, timeRange])

  const getChartData = (range) => {
    if (!dashboardData) return [];
  
    switch (range) {
      case 'month':
        return dashboardData?.monthlyRevenue.map((item) => ({
          time: item.month,
          revenue: item.revenue,
        })) || [];
      case 'year':
        return dashboardData?.yearlyRevenue.map((item) => ({
          time: item.year,
          revenue: item.revenue,
        })) || [];
      default:
        return dashboardData?.weeklyRevenue.map((item) => ({
          time: item.date,
          revenue: item.revenue,
        })) || [];
    }
  };
  

  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      render: (id) => `#${id.slice(-4)}`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'orderItems',
      render: (items) => items?.length || 0,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'name'],
      render: (name) => name || 'Khách',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        filters: [
          { text: 'Chờ xác nhận', value: 'pending' },
          { text: 'Đã xác nhận', value: 'confirmed' },
          { text: 'Đang giao', value: 'shipping' },
          { text: 'Đã giao', value: 'delivered' },
          { text: 'Đã hủy', value: 'cancelled' },
        ],
        onFilter: (value, record) => record.status === value,
        render: (status) => {
          const statusMap = {
            pending: { label: 'Chờ xác nhận', color: 'default' },
            confirmed: { label: 'Đã xác nhận', color: 'blue' },
            shipping: { label: 'Đang giao', color: 'orange' },
            delivered: { label: 'Đã giao', color: 'green' },
            cancelled: { label: 'Đã hủy', color: 'red' },
          }
      
          const { label, color } = statusMap[status] || { label: 'Không rõ', color: 'gray' }
          return <Tag color={color} style={{ fontWeight: 500, padding: '3px 8px', borderRadius: 8 }}>
                {label}
            </Tag>
        
        },
    },
      
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      render: (price) => `${price.toLocaleString()}₫`,
    },
  ]

  const renderPage = (key) => {
    if (key === '') {
      const chartData = getChartData(timeRange)
      console.log('Chart data:', chartData)
      return (
        <Spin spinning={loading}>
          <WrapperContainer>
            <Row gutter={[24, 24]}>
              <Col span={6}><StatCard><CardTitle>Tổng người dùng</CardTitle><CardValue style={{ color: '#1890ff' }}>{dashboardData?.totalUsers || 0}</CardValue></StatCard></Col>
              <Col span={6}><StatCard><CardTitle>Tổng đơn hàng</CardTitle><CardValue style={{ color: '#1890ff' }}>{dashboardData?.totalOrders || 0}</CardValue></StatCard></Col>
              <Col span={6}><StatCard><CardTitle>Chưa thanh toán</CardTitle><CardValue style={{ color: '#1890ff' }}>{dashboardData?.totalPending || 0}</CardValue></StatCard></Col>
              <Col span={6}><StatCard><CardTitle>Tổng doanh thu</CardTitle><CardValue style={{ color: '#1890ff' }}>{(dashboardData?.totalSales || 0).toLocaleString()}₫</CardValue></StatCard></Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col span={16}>
                <RevenueChartCard bordered={false} style={{ padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4}>Biểu đồ Lợi nhuận</Title>
                    <ChartTabs>
                      {/* <Tabs defaultActiveKey="week" onChange={(key) => setTimeRange(key)}>
                        <Tabs.TabPane tab="Tuần" key="week" />
                        <Tabs.TabPane tab="Tháng" key="month" />
                        <Tabs.TabPane tab="Năm" key="year" />
                      </Tabs> */}
                    </ChartTabs>
                  </div>
                  <RevenueChart
                    weeklyData={getChartData('week')}
                    monthlyData={getChartData('month')}
                    yearlyData={getChartData('year')}
                    />

                </RevenueChartCard>
              </Col>
              <Col span={8}>
                <ListCard bordered={false} style={{ borderRadius: 16 }}>
                  <Title level={5}>Bán Chạy Nhất</Title>
                  {dashboardData?.topProducts?.map((product) => (
                    <ListItem key={product._id}>
                      <img src={product.image} alt={product.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      <div className="info">
                        <Text strong>{product.name}</Text>
                        <div style={{ fontSize: 13, color: '#777' }}>{product.price.toLocaleString()}₫</div>
                        <div style={{ fontSize: 13, color: '#777' }}>{product.selled || 0} lượt mua</div>
                      </div>
                    </ListItem>
                  ))}
                </ListCard>
              </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card bordered={false} style={{ borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Title level={5}>Đơn Hàng Gần Đây</Title>
                    {/* <Button type="link">XEM TẤT CẢ</Button> */}
                  </div>
                  <Table
                    rowKey="_id"
                    columns={orderColumns}
                    dataSource={dashboardData?.recentOrders || []}
                    pagination={{ pageSize: 5 }}
                    size="middle"
                    bordered
                    style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#fff',
                    }}
                    rowClassName={() => 'order-row'}
                    />

                </Card>
              </Col>
            </Row>
          </WrapperContainer>
        </Spin>
      )
    }

    switch (key) {
      case 'user': return <AdminUser />
      case 'product': return <AdminProduct />
      case 'order': return <OrderAdmin />
      default: return <></>
    }
  }

  const handleOnClick = ({ key }) => {
    setKeySelected(key)
  }
  useEffect(() => {
    setKeySelected('') // để mặc định khi vào luôn là dashboard
  }, [])
  
  return (
    <>
      <HeaderComponent isHiddenSearch isHiddenCart />
      <div style={{ display: 'flex', overflowX: 'hidden' }}>
        <SidebarMenu>
        <Menu
            mode='inline'
            selectedKeys={[keySelected]} 
            defaultSelectedKeys={['']}   
            style={{ width: '100%', height: '100vh', borderRight: 'none' }}
            items={items}
            onClick={handleOnClick}
        />

        </SidebarMenu>
        <ContentWrapper>{renderPage(keySelected)}</ContentWrapper>
      </div>
    </>
  )
}

export default AdminPage
