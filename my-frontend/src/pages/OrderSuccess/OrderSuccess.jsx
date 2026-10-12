import React, { useEffect, useState } from 'react';
import {
  WrapperContainer,
  WrapperValue,
  WrapperItemOrder,
  WrapperInfo,
  WrapperItemOrderInfo,
  ButtonDetail,
  Label,
} from './style';
import convertPrice from '../../utils';
import Loading from '../../components/LoadingComponent/Loading';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderContant } from '../../contant';
import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  QrcodeOutlined,
  CopyOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import * as PaymentService from '../../service/PaymentService';
import * as message from '../../components/Message/Message';

const OrderSuccess = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();

  const [vnpaySuccess, setVnpaySuccess] = useState(false);
  const [vnpayChecking, setVnpayChecking] = useState(false);
  const [vietQRConfig, setVietQRConfig] = useState(null);

  useEffect(() => {
    if (state?.payment === 'vietqr') {
      PaymentService.getVietQRConfig()
        .then((response) => setVietQRConfig(response?.data || null))
        .catch(() => setVietQRConfig(null));
    }
  }, [state?.payment]);

  // Kiểm tra callback nếu redirect từ VNPay về
  useEffect(() => {
    const search = location.search;
    if (search && search.includes('vnp_ResponseCode')) {
      const verifyVNPay = async () => {
        try {
          setVnpayChecking(true);
          const res = await PaymentService.verifyVNPayReturn(search.substring(1));
          if (res?.status === 'OK') {
            setVnpaySuccess(true);
            message.success('Thanh toán VNPAY thành công!');
          } else {
            message.error('Giao dịch VNPAY không thành công hoặc đã bị hủy.');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setVnpayChecking(false);
        }
      };
      verifyVNPay();
    }
  }, [location.search]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label}!`);
  };

  const orderId = state?.orderId || `DH${Date.now().toString().slice(-6)}`;
  const vietQRAddInfo = `DH${orderId.slice(-6).toUpperCase()}`;
  const vietQRUrl = vietQRConfig
    ? `https://api.vietqr.io/image/${encodeURIComponent(vietQRConfig.bankId)}-${encodeURIComponent(vietQRConfig.accountNo)}-${encodeURIComponent(vietQRConfig.template)}.jpg?amount=${state?.totalPriceMemo || 0}&addInfo=${encodeURIComponent(vietQRAddInfo)}&accountName=${encodeURIComponent(vietQRConfig.accountName)}`
    : '';

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom, #f0f2f5, #ffffff)',
        width: '100%',
        minHeight: '100vh',
        padding: '32px 16px',
      }}
    >
      <Loading isPending={vnpayChecking}>
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: 'linear-gradient(135deg, #13c2c2, #1890ff)',
              padding: '32px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                background: '#fff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircleOutlined style={{ fontSize: '40px', color: '#52c41a' }} />
            </div>
            <h2
              style={{
                color: '#fff',
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              {vnpaySuccess ? 'Thanh toán & Đặt hàng thành công!' : 'Đặt hàng thành công!'}
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
              Cảm ơn bạn đã mua sắm cùng FashionStyle. Đơn hàng của bạn đang được xử lý.
            </p>
          </div>

          <WrapperContainer style={{ padding: '24px' }}>
            {/* Delivery Method & Payment Method Section */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <WrapperInfo
                style={{
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #eaeaea',
                }}
              >
                <Label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
                  Phương thức giao hàng
                </Label>
                <WrapperValue
                  style={{
                    background: 'rgba(24, 144, 255, 0.1)',
                    border: '1px solid rgba(24, 144, 255, 0.2)',
                    color: '#1890ff',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '10px 16px',
                    borderRadius: '8px',
                  }}
                >
                  {orderContant.delivery[state?.delivery] || 'Giao hàng tiêu chuẩn'}
                </WrapperValue>
              </WrapperInfo>

              <WrapperInfo
                style={{
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #eaeaea',
                }}
              >
                <Label style={{ display: 'block', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
                  Phương thức thanh toán
                </Label>
                <WrapperValue
                  style={{
                    background: 'rgba(82, 196, 26, 0.1)',
                    border: '1px solid rgba(82, 196, 26, 0.2)',
                    color: '#52c41a',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '10px 16px',
                    borderRadius: '8px',
                  }}
                >
                  {orderContant.payment[state?.payment] || 'Thanh toán trực tuyến'}
                  {state?.payment === 'vietqr' && <Tag color="blue" style={{ marginLeft: 8 }}>Chờ xác nhận CK</Tag>}
                  {vnpaySuccess && <Tag color="green" style={{ marginLeft: 8 }}>Đã thanh toán VNPAY</Tag>}
                </WrapperValue>
              </WrapperInfo>
            </div>

            {/* Voucher Section (nếu có dùng voucher) */}
            {state?.appliedVoucher && (
              <div
                style={{
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <GiftOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                      Mã voucher đã áp dụng: {state.appliedVoucher.code}
                    </span>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {state.appliedVoucher.name}
                    </div>
                  </div>
                </div>
                <div style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '15px' }}>
                  -{convertPrice(state.appliedVoucher.discountAmount)}
                </div>
              </div>
            )}

            {/* Khối Hướng dẫn chuyển khoản VietQR nếu chọn VietQR */}
            {state?.payment === 'vietqr' && (
              <div
                style={{
                  background: '#f0f5ff',
                  border: '1px solid #adc6ff',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ color: '#0052cc', fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <QrcodeOutlined /> Thông tin chuyển khoản VietQR
                </h3>
                <p style={{ color: '#555', fontSize: '13px', marginBottom: 16 }}>
                  Nếu bạn chưa hoàn tất chuyển khoản, vui lòng quét mã QR dưới đây hoặc chuyển theo thông tin số tài khoản:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
                  <img
                    src={vietQRUrl}
                    alt="VietQR"
                    style={{ width: '220px', borderRadius: 8, border: '1px solid #d9d9d9', background: '#fff', padding: 6 }}
                  />

                  <div style={{ textAlign: 'left', minWidth: '260px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#888' }}>Ngân hàng: </span>
                      <b style={{ color: '#e01e26' }}>Techcombank (Kỹ thương Việt Nam)</b>
                    </div>
                    <div style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => copyToClipboard(vietQRConfig?.accountNo, 'Số tài khoản')}>
                      <span style={{ color: '#888' }}>Số tài khoản: </span>
                      <b style={{ color: '#0052cc', fontSize: '15px' }}>{vietQRConfig?.accountNo} <CopyOutlined /></b>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#888' }}>Chủ tài khoản: </span>
                      <b>{vietQRConfig?.accountName}</b>
                    </div>
                    <div style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => copyToClipboard(state?.totalPriceMemo, 'Số tiền')}>
                      <span style={{ color: '#888' }}>Số tiền: </span>
                      <b style={{ color: '#ff4d4f' }}>{convertPrice(state?.totalPriceMemo)} <CopyOutlined /></b>
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(vietQRAddInfo, 'Nội dung chuyển khoản')}>
                      <span style={{ color: '#888' }}>Nội dung CK: </span>
                      <b style={{ color: '#0052cc', background: '#e6f7ff', padding: '2px 6px', borderRadius: 4 }}>
                        {vietQRAddInfo} <CopyOutlined />
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items Section */}
            {state?.orders?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                  Chi tiết sản phẩm đã đặt
                </h3>

                <WrapperItemOrderInfo
                  style={{
                    border: '1px solid #eaeaea',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {state?.orders?.map((ord, index) => (
                    <WrapperItemOrder
                      key={ord?.name + index}
                      style={{
                        padding: '16px',
                        borderBottom:
                          index < state.orders.length - 1 ? '1px solid #eaeaea' : 'none',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img
                          src={ord.image}
                          alt="product"
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #eaeaea',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#333',
                              marginBottom: '4px',
                            }}
                          >
                            {ord?.name}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              Số lượng: <span style={{ fontWeight: 500 }}>{ord?.amount}</span>
                              {ord?.sizes && ` | Size: ${ord.sizes}`}
                              {ord?.colors && ` | Màu: ${ord.colors}`}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1890ff' }}>
                              {convertPrice(ord?.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </WrapperItemOrder>
                  ))}
                </WrapperItemOrderInfo>
              </div>
            )}

            {/* Total and Detail Button Section */}
            <div
              style={{
                padding: '20px',
                background: '#f9f9f9',
                borderRadius: '12px',
                border: '1px solid #eaeaea',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 500, color: '#555' }}>
                  Tổng thanh toán:
                </span>
                <span style={{ fontSize: '22px', color: '#f5222d', fontWeight: 700 }}>
                  {convertPrice(state?.totalPriceMemo)}
                </span>
              </div>
              <ButtonDetail
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'linear-gradient(to right, #1890ff, #13c2c2)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                }}
              >
                Tiếp tục mua sắm
              </ButtonDetail>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
              <p>Mọi thắc mắc về đơn hàng vui lòng liên hệ hotline: <b>0334400884</b></p>
            </div>
          </WrapperContainer>
        </div>
      </Loading>
    </div>
  );
};

export default OrderSuccess;
