import React, { useMemo, useState } from 'react';
import {
  PageContainer,
  OrderSection,
  PageTitle,
  OrderStatus,
  OrderStatusBadge,
  WrapperHeaderUser,
  WrapperInfoUser,
  WrapperLabel,
  WrapperContentInfo,
  WrapperStyleContent,
  ProductHeader,
  WrapperItemLabel,
  WrapperProduct,
  WrapperNameProduct,
  WrapperItem,
  PriceRow,
  PriceLabel,
  PriceValue,
} from './style';
import { useLocation, useParams } from 'react-router-dom';
import * as OrderService from '../../service/OrderService';
import * as ProductService from '../../service/ProductService';
import { useQuery } from '@tanstack/react-query';
import { orderContant } from '../../contant';
import convertPrice from '../../utils';
import Loading from '../../components/LoadingComponent/Loading';
import ReviewSection from './ReviewSection'; // Import component ReviewSection đã cải tiến
import { toast } from 'react-toastify';
import { Button, Card, Checkbox, Input, InputNumber, Modal, Select, Space, Tag, Timeline, Typography } from 'antd';
import { getStoredAccessToken } from '../../service/UserService';

const DetailsOrderPage = () => {
  const params = useParams();
  const { id } = params;
  const location = useLocation();
  const { state } = location;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnType, setReturnType] = useState('return_refund');
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const token = state?.token || getStoredAccessToken();

  const fetchDetailsOrder = async () => {
    const res = await OrderService.getDetailsOrder(id, token);
    return res.data;
  };

  const queryOrder = useQuery({
    queryKey: ['orders-details', id],
    queryFn: fetchDetailsOrder,
    enabled: Boolean(id),
  });

  const { isPending, data } = queryOrder;

  const returnsQuery = useQuery({
    queryKey: ['my-returns', id],
    queryFn: () => OrderService.getMyReturns(token),
    enabled: Boolean(token && data?.status === 'delivered'),
  });
  const orderReturns = (returnsQuery.data?.data || []).filter((request) => String(request.order?._id || request.order) === String(id));

  const priceMemo = useMemo(() => {
    const result = data?.orderItems?.reduce((total, cur) => {
      return total + cur.price * cur.amount;
    }, 0);
    return result;
  }, [data]);

  const totalDiscount = useMemo(() => {
    const result = data?.orderItems?.reduce((total, cur) => {
      return total + (cur.discount ? (cur.price * cur.amount * cur.discount) / 100 : 0);
    }, 0);
    return result || 0;
  }, [data]);

  const orderStatus = ({
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng', cancelled: 'Đã hủy', expired: 'Hết hạn thanh toán',
    payment_review: 'Thanh toán cần kiểm tra',
  })[data?.status] || 'Đang xử lý';
  const paymentStatus = data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

  const openReturnModal = () => {
    setSelectedItems(Object.fromEntries((data?.orderItems || []).map((item) => [item._id, { checked: true, quantity: 1 }])));
    setReturnOpen(true);
  };

  const submitReturn = async () => {
    const items = Object.entries(selectedItems)
      .filter(([, value]) => value.checked)
      .map(([orderItemId, value]) => ({ orderItemId, quantity: Number(value.quantity) }));
    if (!items.length || !returnReason.trim()) return toast.error('Vui lòng chọn sản phẩm và nhập lý do');
    setIsSubmitting(true);
    try {
      const result = await OrderService.createReturnRequest({
        orderId: id, type: returnType, items, reason: returnReason,
        description: returnDescription,
        evidenceUrls: evidenceUrls.split(/[\n,]/).map((url) => url.trim()).filter(Boolean),
      }, token);
      if (result.status !== 'OK') throw new Error(result.message);
      toast.success(result.message);
      setReturnOpen(false);
      returnsQuery.refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Không thể gửi yêu cầu đổi trả');
    } finally { setIsSubmitting(false); }
  };

  // Hàm xử lý thêm đánh giá sản phẩm
  const handleAddReview = async (productId, rating, comment) => {
    if (!state?.token) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá');
      return { success: false, message: 'Vui lòng đăng nhập để gửi đánh giá' };
    }

    try {
      setIsSubmitting(true);
      const response = await ProductService.addReview(productId, Number(rating), comment, state?.token);
      
      if (response.status === 'OK') {
        toast.success('Đánh giá đã được gửi thành công!');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Có lỗi xảy ra khi gửi đánh giá');
      return { success: false, message: 'Có lỗi xảy ra khi gửi đánh giá' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Loading isPending={isPending}>
      <PageContainer>
        <OrderSection>
          <PageTitle>Chi tiết đơn hàng #{id}</PageTitle>

          <OrderStatus>
            <OrderStatusBadge status={data?.status === 'delivered' ? 'delivered' : 'processing'}>
              {orderStatus}
            </OrderStatusBadge>
            <OrderStatusBadge status={data?.isPaid ? 'paid' : 'unpaid'}>
              {paymentStatus}
            </OrderStatusBadge>
          </OrderStatus>

          <WrapperHeaderUser>
            <WrapperInfoUser>
              <WrapperLabel>Địa chỉ người nhận</WrapperLabel>
              <WrapperContentInfo>
                <div className="name-info">{data?.shippingAddress?.fullName}</div>
                <div className="address-info">
                  <span>Địa chỉ: </span>
                  {`${data?.shippingAddress?.address} ${data?.shippingAddress?.city}`}
                </div>
                <div className="phone-info">
                  <span>Điện thoại: </span>
                  {data?.shippingAddress?.phone}
                </div>
                <div className="order-date">
                Ngày đặt hàng:{' '}
                {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
              </WrapperContentInfo>
            </WrapperInfoUser>

            <WrapperInfoUser>
              <WrapperLabel>Hình thức giao hàng</WrapperLabel>
              <WrapperContentInfo>
                <div className="delivery-info">
                  <span className="name-delivery">FAST</span> Giao hàng tiết kiệm
                </div>
                <div className="delivery-fee">
                  <span>Phí vận chuyển:</span> {convertPrice(data?.shippingPrice)}
                </div>
              </WrapperContentInfo>
            </WrapperInfoUser>

            <WrapperInfoUser>
              <WrapperLabel>Hình thức thanh toán</WrapperLabel>
              <WrapperContentInfo>
                <div className="payment-info">{orderContant.payment[data?.paymentMethod]}</div>
                <div className="status-payment">
                  {data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </div>
              </WrapperContentInfo>
            </WrapperInfoUser>
          </WrapperHeaderUser>

          <WrapperStyleContent>
            <ProductHeader>
              <div className="product-column">Sản phẩm</div>
              <WrapperItemLabel>Giá</WrapperItemLabel>
              <WrapperItemLabel>Số lượng</WrapperItemLabel>
              <WrapperItemLabel>Giảm giá</WrapperItemLabel>
            </ProductHeader>

            {data?.orderItems?.map((order, index) => (
              <WrapperProduct key={index}>
                <WrapperNameProduct>
                  <img src={order?.image} alt={order?.name} />
                  <div>
                    {order?.name}
                    <div className="product-variant">
                      {(order?.sizes || order?.colors) && (
                        <>
                          {order?.sizes && <span>Size: {order?.sizes}</span>}
                          {order?.sizes && order?.colors && <span className="separator">|</span>}
                          {order?.colors && <span>Màu: {order?.colors}</span>}
                        </>
                      )}
                    </div>
                  </div>
                </WrapperNameProduct>
                <WrapperItem>{convertPrice(order?.price)}</WrapperItem>
                <WrapperItem>{order?.amount}</WrapperItem>
                <WrapperItem>{order?.discount ? `${order?.discount}%` : '0%'}</WrapperItem>
              </WrapperProduct>
            ))}

            <PriceRow>
              <PriceLabel>Tạm tính</PriceLabel>
              <PriceValue>{convertPrice(priceMemo)}</PriceValue>
            </PriceRow>

            {totalDiscount > 0 && (
              <PriceRow>
                <PriceLabel>Giảm giá</PriceLabel>
                <PriceValue discount>- {convertPrice(totalDiscount)}</PriceValue>
              </PriceRow>
            )}

            <PriceRow>
              <PriceLabel>Phí vận chuyển</PriceLabel>
              <PriceValue>{convertPrice(data?.shippingPrice)}</PriceValue>
            </PriceRow>

            <PriceRow total>
              <PriceLabel>Tổng cộng</PriceLabel>
              <PriceValue total>{convertPrice(data?.totalPrice)}</PriceValue>
            </PriceRow>
          </WrapperStyleContent>

          <Card title="Theo dõi đơn hàng" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ marginBottom: 16 }}>
              {data?.trackingNumber && <div><strong>Mã vận đơn:</strong> {data.trackingNumber}</div>}
              {data?.carrier && <div><strong>Đơn vị vận chuyển:</strong> {data.carrier}</div>}
              {data?.estimatedDeliveryAt && <div><strong>Dự kiến giao:</strong> {new Date(data.estimatedDeliveryAt).toLocaleString('vi-VN')}</div>}
            </Space>
            <Timeline items={(data?.trackingHistory || []).slice().reverse().map((event) => ({
              color: event.status === 'delivered' ? 'green' : ['cancelled', 'expired'].includes(event.status) ? 'red' : 'blue',
              children: (
                <div>
                  <strong>{event.title}</strong>
                  {event.description && <div>{event.description}</div>}
                  {event.location && <div>{event.location}</div>}
                  <small>{new Date(event.createdAt).toLocaleString('vi-VN')}</small>
                </div>
              ),
            }))} />
          </Card>

          {data?.status === 'delivered' && (
            <Card title="Đổi trả & hoàn tiền" style={{ marginTop: 24 }}>
              {orderReturns.length > 0 ? orderReturns.map((request) => (
                <div key={request._id} style={{ marginBottom: 8 }}>
                  <Tag color={request.status === 'rejected' ? 'red' : request.status === 'refunded' ? 'green' : 'blue'}>{request.status}</Tag>
                  {request.reason} — {Number(request.refundAmount).toLocaleString('vi-VN')} ₫
                </div>
              )) : <Typography.Paragraph>Bạn có thể gửi yêu cầu trong thời hạn đổi trả của cửa hàng.</Typography.Paragraph>}
              {orderReturns.every((request) => request.status === 'rejected') && (
                <Button type="primary" onClick={openReturnModal}>Yêu cầu đổi trả</Button>
              )}
            </Card>
          )}

          <Modal open={returnOpen} title="Tạo yêu cầu đổi trả" onCancel={() => setReturnOpen(false)}
            onOk={submitReturn} confirmLoading={isSubmitting} okText="Gửi yêu cầu" width={680}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Select value={returnType} onChange={setReturnType} style={{ width: '100%' }} options={[
                { value: 'return_refund', label: 'Trả hàng và hoàn tiền' },
                { value: 'refund_only', label: 'Chỉ hoàn tiền' },
              ]} />
              {(data?.orderItems || []).map((item) => {
                const selection = selectedItems[item._id] || { checked: false, quantity: 1 };
                return (
                  <Space key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Checkbox checked={selection.checked} onChange={(event) => setSelectedItems({
                      ...selectedItems, [item._id]: { ...selection, checked: event.target.checked },
                    })}>{item.name} ({item.size || item.sizes?.[0]} / {item.color || item.colors?.[0]})</Checkbox>
                    <InputNumber min={1} max={item.amount} value={selection.quantity} disabled={!selection.checked}
                      onChange={(quantity) => setSelectedItems({ ...selectedItems, [item._id]: { ...selection, quantity } })} />
                  </Space>
                );
              })}
              <Input value={returnReason} onChange={(event) => setReturnReason(event.target.value)} placeholder="Lý do đổi trả (bắt buộc)" maxLength={300} />
              <Input.TextArea value={returnDescription} onChange={(event) => setReturnDescription(event.target.value)} placeholder="Mô tả chi tiết" rows={3} maxLength={2000} />
              <Input.TextArea value={evidenceUrls} onChange={(event) => setEvidenceUrls(event.target.value)} placeholder="Link ảnh/video minh chứng, mỗi link một dòng (tối đa 5)" rows={2} />
            </Space>
          </Modal>

          <ReviewSection 
            orderItems={data?.orderItems} 
            isDelivered={data?.isDelivered}
            onAddReview={handleAddReview}
            isSubmitting={isSubmitting}
            authToken={token}
          />
        </OrderSection>
      </PageContainer>
    </Loading>
  );
};

export default DetailsOrderPage;
