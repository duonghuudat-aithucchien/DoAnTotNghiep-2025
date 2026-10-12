import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Tag,
  Space,
  Popconfirm,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import * as VoucherService from '../../service/VoucherService';
import { getStoredAccessToken } from '../../service/UserService';
import * as message from '../Message/Message';
import convertPrice from '../../utils';
import dayjs from 'dayjs';

const { Option } = Select;

const AdminVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [discountType, setDiscountType] = useState('fixed');
  const [form] = Form.useForm();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const access_token = getStoredAccessToken();
      const res = await VoucherService.getAllVouchers(access_token, 100, 0);
      if (res?.status === 'OK') {
        setVouchers(res?.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy voucher:', err);
      message.error('Không thể lấy danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setDiscountType('fixed');
    form.resetFields();
    form.setFieldsValue({
      discountType: 'fixed',
      minOrderValue: 0,
      usageLimit: 100,
      endDate: dayjs().add(30, 'day'),
    });
    setIsOpenModal(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingVoucher(record);
    setDiscountType(record.discountType);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      discountType: record.discountType,
      discountValue: record.discountValue,
      maxDiscountAmount: record.maxDiscountAmount,
      minOrderValue: record.minOrderValue,
      endDate: dayjs(record.endDate),
      usageLimit: record.usageLimit,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const access_token = getStoredAccessToken();

      const payload = {
        ...values,
        code: values.code.trim().toUpperCase(),
        endDate: values.endDate.toISOString(),
      };

      if (editingVoucher) {
        const res = await VoucherService.updateVoucher(
          editingVoucher._id,
          payload,
          access_token
        );
        if (res?.status === 'OK') {
          message.success('Cập nhật voucher thành công');
          setIsOpenModal(false);
          fetchVouchers();
        } else {
          message.error(res?.message || 'Cập nhật voucher thất bại');
        }
      } else {
        const res = await VoucherService.createVoucher(payload, access_token);
        if (res?.status === 'OK') {
          message.success('Tạo mã voucher mới thành công');
          setIsOpenModal(false);
          fetchVouchers();
        } else {
          message.error(res?.message || 'Tạo voucher thất bại');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const access_token = getStoredAccessToken();
      const res = await VoucherService.deleteVoucher(id, access_token);
      if (res?.status === 'OK') {
        message.success('Đã xóa voucher');
        fetchVouchers();
      } else {
        message.error(res?.message || 'Xóa voucher thất bại');
      }
    } catch (err) {
      message.error('Không thể xóa voucher');
    }
  };

  const handleToggleActive = async (record) => {
    try {
      const access_token = getStoredAccessToken();
      const res = await VoucherService.updateVoucher(
        record._id,
        { isActive: !record.isActive },
        access_token
      );
      if (res?.status === 'OK') {
        message.success(`Đã ${!record.isActive ? 'kích hoạt' : 'tạm dừng'} voucher`);
        fetchVouchers();
      }
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái voucher');
    }
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (text) => (
        <Tag color="red" style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Tên Voucher',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
    },
    {
      title: 'Mức giảm giá',
      key: 'discount',
      render: (_, record) => (
        <span style={{ fontWeight: '600', color: '#52c41a' }}>
          {record.discountType === 'percent'
            ? `${record.discountValue}% (Tối đa ${convertPrice(record.maxDiscountAmount || 0)})`
            : convertPrice(record.discountValue)}
        </span>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (val) => convertPrice(val || 0),
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => {
        const isExpired = new Date(date) < new Date();
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : '#333' }}>
            {new Date(date).toLocaleDateString('vi-VN')} {isExpired && <Tag color="error">Hết hạn</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Lượt dùng',
      key: 'usage',
      render: (_, record) => (
        <span>
          <b>{record.usedCount || 0}</b> / {record.usageLimit || 0}
        </span>
      ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa mã voucher này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px', background: '#fff', borderRadius: '8px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiftOutlined style={{ color: '#ff4d4f' }} /> Quản lý Mã giảm giá (Vouchers)
        </h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchVouchers}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            style={{ background: '#000', borderColor: '#000' }}
          >
            Thêm Voucher mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo mới Voucher'}
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleSubmit}
        okText={editingVoucher ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã Voucher"
            name="code"
            rules={[
              { required: true, message: 'Vui lòng nhập mã voucher' },
              {
                pattern: /^[A-Z0-9_-]+$/,
                message: 'Mã voucher chỉ gồm chữ hoa, số và dấu gạch',
              },
            ]}
          >
            <Input
              placeholder="VD: FASHION10, SALE50K"
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>

          <Form.Item
            label="Tên / Mô tả Voucher"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên voucher' }]}
          >
            <Input placeholder="VD: Giảm 50K cho đơn hàng từ 300K" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Loại giảm giá"
              name="discountType"
              rules={[{ required: true }]}
            >
              <Select onChange={(val) => setDiscountType(val)}>
                <Option value="fixed">Số tiền cố định (VND)</Option>
                <Option value="percent">Phần trăm (%)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (VND)'}
              name="discountValue"
              rules={[{ required: true, message: 'Vui lòng nhập mức giảm' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={discountType === 'percent' ? 100 : 10000000}
                placeholder={discountType === 'percent' ? 'VD: 10 (%)' : 'VD: 50000 (VND)'}
              />
            </Form.Item>
          </div>

          {discountType === 'percent' && (
            <Form.Item
              label="Số tiền giảm tối đa (VND)"
              name="maxDiscountAmount"
              help="Để trống nếu không giới hạn mức giảm tối đa"
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 50000" />
            </Form.Item>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Giá trị đơn tối thiểu (VND)"
              name="minOrderValue"
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 200000" />
            </Form.Item>

            <Form.Item
              label="Giới hạn số lượt dùng"
              name="usageLimit"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 100" />
            </Form.Item>
          </div>

          <Form.Item
            label="Hạn sử dụng"
            name="endDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVoucher;
