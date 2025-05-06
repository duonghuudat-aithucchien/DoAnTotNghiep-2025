import React, { useState } from 'react';
import { Select, Tag } from 'antd';
import { toast } from 'react-toastify';
import { updateOrderStatus } from '../../service/OrderService';
import { useQueryClient } from '@tanstack/react-query';

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'default' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
  { value: 'shipping', label: 'Đang giao', color: 'orange' },
  { value: 'delivered', label: 'Đã giao', color: 'green' },
  { value: 'cancelled', label: 'Đã hủy', color: 'red' },
];

const OrderStatusUpdater = ({ orderId, currentStatus, accessToken, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const isFinalStatus = currentStatus === 'delivered' || currentStatus === 'cancelled';

  const handleChange = async (newStatus) => {
    if (newStatus === currentStatus || isFinalStatus || !accessToken) return;

    setLoading(true);
    try {
      const res = await updateOrderStatus(orderId, newStatus, accessToken);
      if (res.status === 'OK') {
        toast.success('Cập nhật trạng thái thành công!');
        
        // Update cache
        queryClient.setQueryData(['orders'], (oldData) => {
          if (!oldData) return oldData;
          const newOrders = oldData.data.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          );
          return { ...oldData, data: newOrders };
        });

        // Notify parent component
        if (onStatusChange) onStatusChange(newStatus);
      } else {
        toast.error(res.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={currentStatus}
      onChange={handleChange}
      loading={loading}
      style={{ width: 160 }}
      dropdownMatchSelectWidth={false}
      disabled={isFinalStatus}
      aria-label="Chọn trạng thái đơn hàng"
      title="Chọn trạng thái đơn hàng"
    >
      {statusOptions.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          <Tag color={option.color}>{option.label}</Tag>
        </Select.Option>
      ))}
    </Select>
  );
};

export default OrderStatusUpdater;
