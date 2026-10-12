import React from 'react'
import { WrapperHeader } from './style'
import { Button, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import TableComponent from '../TableComponent/TableComponent'
import InputComponent from '../InputComponent/InputComponent'
import * as OrderService from '../../service/OrderService'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { orderContant } from '../../contant'
import OrderStatusUpdater from './OrderStatusUpdater'
import { format } from 'date-fns';

const OrderAdmin = ({ onOrderUpdate }) => {
  const user = useSelector((state) => state?.user)
  const queryClient = useQueryClient()

  const getAllOrder = async () => {
    const res = await OrderService.getAllOrder(user?.access_token)
    return res
  }

  const queryOrder = useQuery({ queryKey: ['orders'], queryFn: getAllOrder })
  const { isPending: isPendingOrders, data: orders } = queryOrder


  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm()
  }

  const handleReset = (clearFilters) => {
    clearFilters()
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <InputComponent
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  })

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      sorter: (a, b) => a._id.length - b._id.length,
      ...getColumnSearchProps('_id'),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'userName',
      sorter: (a, b) => a.userName.length - b.userName.length,
      ...getColumnSearchProps('userName'),
    },
    
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm:ss'),
      ...getColumnSearchProps('createdAt'),
    },
    
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'isPaid',
      sorter: (a, b) => a.isPaid.length - b.isPaid.length,
      ...getColumnSearchProps('isPaid'),
    },
    
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      render: (_, record) => (
        <OrderStatusUpdater
          orderId={record._id}
          currentStatus={record.status}
          accessToken={user?.access_token}
          onStatusChange={(newStatus) => {
            // ✅ Cập nhật local cache
            queryClient.setQueryData(['orders'], (oldData) => {
              if (!oldData) return oldData
              const updated = oldData.data.map((order) =>
                order._id === record._id ? { ...order, status: newStatus } : order
              )
              return { ...oldData, data: updated }
            })

            // ✅ Gọi hàm cập nhật dashboard
            if (onOrderUpdate) onOrderUpdate()
          }}
        />
      ),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      sorter: (a, b) => a.paymentMethod.length - b.paymentMethod.length,
      ...getColumnSearchProps('paymentMethod'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
      ...getColumnSearchProps('totalPrice'),
    },
  ]

  const dataTable =
    orders?.data?.length &&
    orders?.data?.map((order) => ({
      ...order,
      key: order._id,
      userName: order?.shippingAddress?.fullName,
      itemName: order?.orderItems?.map((item) => item.name).join(', '),
      phone: order?.shippingAddress?.phone,
      address: order?.shippingAddress?.address,
      paymentMethod: orderContant.payment[order?.paymentMethod],
      isPaid: order?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      isDelivered: order?.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng',
      itemsPrice: order?.itemsPrice.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      }),
      totalPrice: order?.totalPrice.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      }),
      shippingPrice: order?.shippingPrice.toLocaleString('it-IT', {
        style: 'currency',
        currency: 'VND',
      }),
      status: order?.status,
    }))

  return (
    <div>
      <WrapperHeader>Quản lý đơn hàng</WrapperHeader>
      {/* <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ height: '200px', width: '200px' }}>
        <PieChartComponent data={orders?.data} />
      </div>
      <div style={{ height: '200px', width: '200px' }}>
        <ProductTypePieChart data={orders?.data} />
        </div>
    </div> */}

      <div style={{ marginTop: '20px' }}>
        <TableComponent columns={columns} isPending={isPendingOrders} data={dataTable} />
      </div>
      {/* <div style={{ height: 400, marginTop: 20 }}>
        <BarChartComponent data={orders?.data} />
      </div> */}
    </div>
  )
}

export default OrderAdmin
