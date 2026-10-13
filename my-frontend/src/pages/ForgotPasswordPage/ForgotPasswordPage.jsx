import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import * as UserService from '../../service/UserService';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async ({ email }) => {
    setLoading(true);
    try {
      await UserService.requestPasswordReset(email.trim().toLowerCase());
      setSent(true);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f5f5', padding: 16 }}>
    <Card style={{ width: '100%', maxWidth: 440 }}>
      <Typography.Title level={2}>Quên mật khẩu</Typography.Title>
      {sent ? <><Typography.Paragraph>Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu. Hãy kiểm tra cả thư rác.</Typography.Paragraph><Link to="/sign-in">Quay lại đăng nhập</Link></> : <Form layout="vertical" onFinish={submit}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}><Input autoComplete="email" placeholder="ban@example.com" /></Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>Gửi liên kết đặt lại</Button>
        <div style={{ marginTop: 16 }}><Link to="/sign-in">Quay lại đăng nhập</Link></div>
      </Form>}
    </Card>
  </div>;
};

export default ForgotPasswordPage;
