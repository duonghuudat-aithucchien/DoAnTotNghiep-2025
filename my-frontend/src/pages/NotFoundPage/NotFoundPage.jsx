import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: '#f0f2f5',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', margin: 0, color: '#1890ff' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '16px 0', color: '#333' }}>Không tìm thấy trang</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xoá.
      </p>
      <button
        onClick={goHome}
        style={{
          padding: '10px 24px',
          backgroundColor: '#1890ff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Quay lại trang chủ
      </button>
    </div>
  );
};

export default NotFoundPage;
