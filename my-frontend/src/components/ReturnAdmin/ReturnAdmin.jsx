import React, { useState } from 'react';
import { Button, Input, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as OrderService from '../../service/OrderService';

const { Title } = Typography;

const labels = {
  requested: ['Mới tạo', 'blue'], approved: ['Đã duyệt', 'cyan'], rejected: ['Từ chối', 'red'],
  awaiting_return: ['Chờ gửi hàng', 'orange'], received: ['Đã nhận hàng', 'purple'],
  refund_processing: ['Đang hoàn tiền', 'gold'], refunded: ['Đã hoàn tiền', 'green'], closed: ['Đã đóng', 'default'],
};

const nextStatuses = {
  requested: ['approved', 'rejected'],
  approved: ['awaiting_return'],
  awaiting_return: ['received'],
  refunded: ['closed'],
};

const ReturnAdmin = () => {
  const token = useSelector((state) => state?.user?.access_token);
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState('');
  const [refundRequest, setRefundRequest] = useState(null);
  const [manualReference, setManualReference] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: () => OrderService.getAllReturns(token),
    enabled: Boolean(token),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-returns'] });

  const changeStatus = async (record, status) => {
    setBusyId(record._id);
    try {
      const result = await OrderService.updateReturnStatus(record._id, { status }, token);
      if (result.status !== 'OK') throw new Error(result.message);
      toast.success(result.message);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật yêu cầu');
    } finally { setBusyId(''); }
  };

  const refund = async () => {
    setBusyId(refundRequest._id);
    try {
      const result = await OrderService.processRefund(refundRequest._id, { manualReference }, token);
      if (result.status !== 'OK') throw new Error(result.message);
      toast.success(result.message);
      setRefundRequest(null);
      setManualReference('');
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Hoàn tiền thất bại');
    } finally { setBusyId(''); }
  };

  const columns = [
    { title: 'Mã yêu cầu', dataIndex: '_id', render: (id) => `#${id.slice(-8)}` },
    { title: 'Khách hàng', render: (_, row) => row.user?.name || row.user?.email || row.order?.shippingAddress?.fullName },
    { title: 'Loại', dataIndex: 'type', render: (value) => value === 'refund_only' ? 'Chỉ hoàn tiền' : 'Trả hàng & hoàn tiền' },
    { title: 'Sản phẩm', dataIndex: 'items', render: (items) => items.map((item) => `${item.name} × ${item.quantity}`).join(', ') },
    { title: 'Số tiền', dataIndex: 'refundAmount', render: (value) => `${Number(value).toLocaleString('vi-VN')} ₫` },
    { title: 'Trạng thái', dataIndex: 'status', render: (status) => <Tag color={labels[status]?.[1]}>{labels[status]?.[0] || status}</Tag> },
    {
      title: 'Xử lý',
      render: (_, row) => (
        <Space wrap>
          {(nextStatuses[row.status] || []).length > 0 && (
            <Select
              placeholder="Chuyển trạng thái"
              style={{ width: 160 }}
              loading={busyId === row._id}
              onChange={(status) => changeStatus(row, status)}
              options={nextStatuses[row.status].map((status) => ({ value: status, label: labels[status]?.[0] || status }))}
            />
          )}
          {((row.type === 'refund_only' && row.status === 'approved') || ['received', 'refund_processing'].includes(row.status)) && (
            <Button type="primary" loading={busyId === row._id} onClick={() => setRefundRequest(row)}>Hoàn tiền</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Đổi trả & hoàn tiền</Title>
      <Table rowKey="_id" loading={isPending} columns={columns} dataSource={data?.data || []} scroll={{ x: 1000 }} />
      <Modal
        open={Boolean(refundRequest)}
        title="Xác nhận hoàn tiền"
        onCancel={() => setRefundRequest(null)}
        onOk={refund}
        confirmLoading={Boolean(refundRequest && busyId === refundRequest._id)}
      >
        <p>Số tiền: <strong>{Number(refundRequest?.refundAmount || 0).toLocaleString('vi-VN')} ₫</strong></p>
        <p>PayPal/VNPAY sẽ được gọi tự động. Với COD/VietQR, nhập mã giao dịch hoàn tiền thủ công.</p>
        <Input value={manualReference} onChange={(event) => setManualReference(event.target.value)} placeholder="Mã tham chiếu (nếu hoàn thủ công)" />
      </Modal>
    </div>
  );
};

export default ReturnAdmin;
