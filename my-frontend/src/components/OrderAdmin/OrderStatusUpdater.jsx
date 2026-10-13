import React, { useState } from 'react';
import { DatePicker, Input, Modal, Select, Space, Tag } from 'antd';
import { toast } from 'react-toastify';
import { updateOrderStatus } from '../../service/OrderService';
import { useQueryClient } from '@tanstack/react-query';

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'default' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
  { value: 'shipping', label: 'Đang giao', color: 'orange' },
  { value: 'delivered', label: 'Đã giao', color: 'green' },
  { value: 'cancelled', label: 'Đã hủy', color: 'red' },
  { value: 'expired', label: 'Hết hạn thanh toán', color: 'volcano', disabled: true },
  { value: 'payment_review', label: 'Cần kiểm tra thanh toán', color: 'magenta', disabled: true },
];

const OrderStatusUpdater = ({ orderId, currentStatus, accessToken, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [shipping, setShipping] = useState({ carrier: '', trackingNumber: '', description: '', estimatedDeliveryAt: null });
  const queryClient = useQueryClient();
  const isFinalStatus = ['delivered', 'cancelled', 'expired', 'payment_review'].includes(currentStatus);

  const submitStatus = async (newStatus, extra = {}) => {
    if (newStatus === currentStatus || isFinalStatus || !accessToken) return;
    setLoading(true);
    try {
      const res = await updateOrderStatus(orderId, { status: newStatus, ...extra }, accessToken);
      if (res.status !== 'OK') throw new Error(res.message);
      toast.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (onStatusChange) onStatusChange(newStatus);
      setShippingOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật đơn hàng');
    } finally { setLoading(false); }
  };

  const handleChange = (newStatus) => {
    if (newStatus === 'shipping') return setShippingOpen(true);
    submitStatus(newStatus);
  };

  return (
    <>
      <Select value={currentStatus} onChange={handleChange} loading={loading} style={{ width: 180 }}
        dropdownMatchSelectWidth={false} disabled={isFinalStatus} aria-label="Chọn trạng thái đơn hàng">
        {statusOptions.map((option) => (
          <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
            <Tag color={option.color}>{option.label}</Tag>
          </Select.Option>
        ))}
      </Select>
      <Modal open={shippingOpen} title="Thông tin vận chuyển" onCancel={() => setShippingOpen(false)}
        onOk={() => submitStatus('shipping', { ...shipping, estimatedDeliveryAt: shipping.estimatedDeliveryAt?.toISOString() })}
        confirmLoading={loading} okText="Bắt đầu giao hàng">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="Đơn vị vận chuyển" value={shipping.carrier} onChange={(event) => setShipping({ ...shipping, carrier: event.target.value })} />
          <Input placeholder="Mã vận đơn" value={shipping.trackingNumber} onChange={(event) => setShipping({ ...shipping, trackingNumber: event.target.value })} />
          <DatePicker showTime placeholder="Dự kiến giao" style={{ width: '100%' }} value={shipping.estimatedDeliveryAt} onChange={(value) => setShipping({ ...shipping, estimatedDeliveryAt: value })} />
          <Input.TextArea placeholder="Ghi chú vận chuyển" value={shipping.description} onChange={(event) => setShipping({ ...shipping, description: event.target.value })} />
        </Space>
      </Modal>
    </>
  );
};

export default OrderStatusUpdater;
