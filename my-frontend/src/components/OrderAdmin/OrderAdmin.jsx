import React, { useState } from 'react'
import { WrapperHeader } from './style'
import { Button, Space } from 'antd'
import {SearchOutlined } from '@ant-design/icons'
import TableComponent from '../TableComponent/TableComponent'
import InputComponent from '../InputComponent/InputComponent'
import * as OrderService from '../../service/OrderService'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { orderContant } from '../../contant'
import PieChartComponent from './PieChartComponent'
import BarChartComponent from './BarChartComponent'



const OrderAdmin = () => {
      const user = useSelector((state) => state?.user)
  
      const getAllOrder = async () => {
          const res = await OrderService.getAllOrder(user?.access_token)
          return res
      } 
      const queryOrder = useQuery({queryKey: ['orders'], queryFn: getAllOrder})
      const {isPending: isPendingOrders, data: orders } = queryOrder

  
      const handleSearch = (selectedKeys, confirm, dataIndex) => {
          confirm();
          // setSearchText(selectedKeys[0]);
          // setSearchedColumn(dataIndex);
        };
        const handleReset = (clearFilters) => {
          clearFilters();
          // setSearchText('');
        };
  
      const getColumnSearchProps = (dataIndex) => ({
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
              style={{
                padding: 8,
              }}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <InputComponent
                // ref={searchInput}
                placeholder={`Search ${dataIndex}`}
                value={`${selectedKeys[0] || ''}`}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                style={{
                  marginBottom: 8,
                  display: 'block',
                }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{
                    width: 90,
                  }}
                >
                  Search
                </Button>
                <Button
                  onClick={() => clearFilters && handleReset(clearFilters)}
                  size="small"
                  style={{
                    width: 90,
                  }}
                >
                  Reset
                </Button>
                
                
              </Space>
            </div>
          ),
          filterIcon: (filtered) => (
            <SearchOutlined
              style={{
                color: filtered ? '#1890ff' : undefined,
              }}
            />
          ),
          onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
          onFilterDropdownOpenChange: (visible) => {
            if (visible) {
            //   setTimeout(() => searchInput.current?.select(), 100);
            }
          },
        });
  
      const columns = [
          {
              title: 'Họ tên',
              dataIndex: 'userName',
              sorter: (a, b) => a.userName.length - b.userName.length,
              ...getColumnSearchProps('userName')
          },
          {
            title: 'Tên sản phẩm',
            dataIndex: 'itemName',
            sorter: (a, b) => a.itemName.length - b.itemName.length,
            ...getColumnSearchProps('itemName')
        },
          {
            title: 'Điện thoại',
            dataIndex: 'phone',
            sorter: (a, b) => a.phone.length - b.phone.length,
            ...getColumnSearchProps('phone')
          },
          {
            title: 'Địa chỉ',
            dataIndex: 'address',
            sorter: (a, b) => a.address.length - b.address.length,
            ...getColumnSearchProps('address')
          }, 
          {
            title: 'Giá sản phẩm',
            dataIndex: 'itemsPrice',
            sorter: (a, b) => a.itemsPrice.length - b.itemsPrice.length,
            ...getColumnSearchProps('itemsPrice')
          },
          {
            title: 'Giá vận chuyển',
            dataIndex: 'shippingPrice',
            sorter: (a, b) => a.shippingPrice.length - b.shippingPrice.length,
            ...getColumnSearchProps('shippingPrice')
          },     
          
          {
            title: 'Trạng thái thanh toán',
            dataIndex: 'isPaid',
            sorter: (a, b) => a.isPaid.length - b.isPaid.length,
            ...getColumnSearchProps('isPaid')
          }, 
          {
            title: 'Trạng thái giao hàng',
            dataIndex: 'isDelivered',
            sorter: (a, b) => a.isDelivered.length - b.isDelivered.length,
            ...getColumnSearchProps('isDelivered')
          },    
          {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentMethod',
            sorter: (a, b) => a.paymentMethod.length - b.paymentMethod.length,
            ...getColumnSearchProps('paymentMethod')
          },  
          {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
            ...getColumnSearchProps('totalPrice')
          },               
      ];
  
      const dataTable = orders?.data?.length && orders?.data?.map((order) => {
        return {...order, key: order._id, 
        userName: order?.shippingAddress?.fullName,
        itemName: order?.orderItems?.map((item) => item.name).join(', '),
        phone: order?.shippingAddress?.phone, 
        address: order?.shippingAddress?.address, 
        paymentMethod: orderContant.payment[order?.paymentMethod], 
        isPaid: order?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
        isDelivered: order?.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng',
        itemsPrice: order?.itemsPrice.toLocaleString('it-IT', {style : 'currency', currency : 'VND'}),
        totalPrice: order?.totalPrice.toLocaleString('it-IT', {style : 'currency', currency : 'VND'}),
        shippingPrice: order?.shippingPrice.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})
    }

    })


  return (
    <div>
        <WrapperHeader>Quản lý đơn hàng</WrapperHeader>
        <div style={{height: '200px', width: '200px'}}>
            <PieChartComponent data={orders?.data}/>
        </div>
          <div style={{marginTop: '20px'}}>
              <TableComponent  columns={columns} isPending={isPendingOrders} data={dataTable}
                 
              />
          </div>
          <div style={{ height: 400, marginTop: 20 }}>
            <BarChartComponent data={orders?.data} />
        </div>
    </div>
  )
}

export default OrderAdmin