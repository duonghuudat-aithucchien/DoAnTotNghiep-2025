import React, { useState } from 'react';
import { Button, Card, Form, Input, Result, Typography, message } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as UserService from '../../service/UserService';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const submit = async (values) => {
    setLoading(true);
    try {
      await UserService.resetPassword(token, values);
      setSuccess(true);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Liên kết không hợp lệ hoặc đã hết hạn.');
    } finally { setLoading(false); }
  };
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f5f5', padding: 16 }}>
    <Card style={{ width: '100%', maxWidth: 440 }}>
      {success ? <Result status="success" title="Đặt lại mật khẩu thành công" extra={<Button type="primary" onClick={() => navigate('/sign-in')}>Đăng nhập</Button>} /> : <>
        <Typography.Title level={2}>Tạo mật khẩu mới</Typography.Title>
        <Form layout="vertical" onFinish={submit}>
          <Form.Item name="password" label="Mật khẩu mới" rules={[{ required: true }, { min: 8, message: 'Ít nhất 8 ký tự' }]}><Input.Password autoComplete="new-password" /></Form.Item>
          <Form.Item name="confirmPassword" label="Nhập lại mật khẩu" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu không khớp')); } })]}><Input.Password autoComplete="new-password" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Đặt lại mật khẩu</Button>
          <div style={{ marginTop: 16 }}><Link to="/sign-in">Quay lại đăng nhập</Link></div>
        </Form>
      </>}
    </Card>
  </div>;
};

export default ResetPasswordPage;
