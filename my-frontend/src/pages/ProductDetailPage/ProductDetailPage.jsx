import React from 'react';
import ProductDetailComponent from '../../components/ProductDetailComponent/ProductDetailComponent';
import ProductReviews from '../../components/ProductReviews/ProductReviews'; // Import component hiển thị đánh giá
import { useNavigate, useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams(); // Lấy productId từ URL
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', background: '#efefef' }}>
      <div style={{ width: '1270px', height: '100%', margin: '0 auto' }}>
        <h5 style={{ fontSize: '20px' }}>
          <span
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => {
              navigate('/');
            }}
          >
            Trang chủ
          </span>
          - Chi tiết sản phẩm
        </h5>
        {/* Hiển thị chi tiết sản phẩm */}
        <ProductDetailComponent idProduct={id} />
        {/* Hiển thị đánh giá sản phẩm */}
        <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '20px'}}>Đánh giá sản phẩm</h3>
          <ProductReviews productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;