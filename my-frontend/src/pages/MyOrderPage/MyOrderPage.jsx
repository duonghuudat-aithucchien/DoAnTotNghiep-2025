import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as OrderService from '../../service/OrderService';
import Loading from '../../components/LoadingComponent/Loading';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  WrapperContainer,
  WrapperFooterItem,
  WrapperHeaderItem,
  WrapperListOrder,
  WrapperStatus,
  OrderHeader,
  EmptyOrders,
  PageHeader,
  OrderCard,
  ProductsList,
  OrderContainer
} from './style';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { convertPrice } from '../../utils';
import { message, Pagination, Divider, Tag, Modal, Select } from 'antd';
import { useMutationHooks } from '../../hooks/useMutationHook';

const { Option } = Select;

const orderStatusLabels = {
  pending: ['Chờ xác nhận', 'default'], confirmed: ['Đã xác nhận', 'blue'],
  shipping: ['Đang giao', 'orange'], delivered: ['Đã giao', 'green'],
  cancelled: ['Đã hủy', 'red'], expired: ['Hết hạn thanh toán', 'volcano'],
  payment_review: ['Cần kiểm tra thanh toán', 'magenta'],
};

const MyOrderPage = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchMyOrder = async () => {
    const res = await OrderService.getOrderbyUserId(state?.id, state?.token);
    return res.data;
  };

  const queryOrder = useQuery({
    queryKey: ['users'],
    queryFn: fetchMyOrder,
    enabled: Boolean(state?.id && state?.token),
  });

  const { isPending, data } = queryOrder;

  const mutation = useMutationHooks((data) => {
    const { id, token, orderItems, reason } = data;
    return OrderService.cancelOrder(id, token, orderItems, reason);
  });

  const {
    isPending: isPendingCancle,
    isSuccess: isSuccessCancle,
    isError: isErrorCancle,
    data: dataCancle
  } = mutation;

  const handleDetaisOrder = (id) => {
    navigate(`/details-order/${id}`, {
      state: {
        token: state?.token,
      },
    });
  };

  const handleCancleOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedOrder || !cancelReason) {
      return message.warning('Vui lòng chọn lý do huỷ đơn hàng!');
    }

    mutation.mutate(
      {
        id: selectedOrder._id,
        token: state?.token,
        orderItems: selectedOrder?.orderItems,
        reason: cancelReason,
      },
      {
        onSuccess: () => {
          queryOrder.refetch();
          setShowCancelModal(false);
          setCancelReason('');
          setSelectedOrder(null);
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccessCancle && dataCancle?.status === 'OK') {
      message.success('Huỷ đơn hàng thành công!');
    } else if (isErrorCancle) {
      message.error('Huỷ đơn hàng thất bại!');
    }
  }, [isErrorCancle, isSuccessCancle, dataCancle]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = data?.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Loading isPending={isPending || isPendingCancle}>
      <WrapperContainer>
        <OrderContainer>
          <div className="order-card-container" style={{
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            marginBottom: 24,
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}>
            <PageHeader>
              <h2>Đơn hàng của tôi</h2>
              {Array.isArray(data) && data.length > itemsPerPage && (
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={data.length}
                  onChange={handlePageChange}
                  size="small"
                />
              )}
            </PageHeader>

            <div style={{ padding: '8px 16px', backgroundColor: '#f9f9f9' }}>
              <WrapperListOrder>
                {Array.isArray(currentOrders) && currentOrders.length > 0 ? (
                  currentOrders.map((list, index) => (
                    <OrderCard key={list._id} isLast={index === currentOrders.length - 1}>
                      <OrderHeader>
                        <div className="order-id">
                          <span className="id-label" style={{ fontSize: 18 }}>Mã đơn:</span>
                          <span className="id-value" style={{ fontSize: 18 }}>
                            {list?._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <WrapperStatus>
                          <Tag color={orderStatusLabels[list?.status]?.[1] || 'default'}>
                            {orderStatusLabels[list?.status]?.[0] || list?.status}
                          </Tag>
                          <Tag color={list?.isPaid ? 'green' : 'gold'}>
                            {list?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Tag>
                        </WrapperStatus>
                      </OrderHeader>

                      <ProductsList>
                        {list?.orderItems?.map((order, idx) => (
                          <div key={order._id}>
                            <WrapperHeaderItem>
                              <img src={order?.image} alt={order?.name} />
                              <div className="product-info-container" style={{ flex: 1 }}>
                                <div className="product-info">{order?.name}</div>
                                <div className="product-meta">
                                  {order?.sizes && <span>Size: {order?.sizes}</span>}
                                  {order?.colors && <span>Màu: {order?.colors}</span>}
                                  <span>Số lượng: {order?.amount}</span>
                                </div>
                              </div>
                              <div className="product-price" style={{ fontSize: 18 }}>
                                {convertPrice(order?.price)}
                              </div>
                            </WrapperHeaderItem>
                            {idx < list?.orderItems?.length - 1 && (
                              <Divider style={{ margin: '0' }} />
                            )}
                          </div>
                        ))}
                      </ProductsList>

                      <WrapperFooterItem>
                        <div>
                          <span className="total-label" style={{ fontSize: 18 }}>Tổng tiền:</span>
                          <span className="total-price" style={{ fontSize: 18 }}>
                            {convertPrice(list?.totalPrice)}
                          </span>
                        </div>
                        <div className="actions" style={{ display: 'flex', gap: '12px' }}>
                          {['pending', 'confirmed'].includes(list?.status) && !list?.isPaid && (
                            <ButtonComponent
                              onClick={() => handleCancleOrder(list)}
                              size={40}
                              styleButton={{
                                backgroundColor: '#fff',
                                border: '1px solid #ff4d4f',
                                borderRadius: 6,
                                height: 36,
                                padding: '0 16px',
                                minWidth: '100px',
                              }}
                              textButton="Huỷ đơn hàng"
                              styleTextButton={{
                                color: '#ff4d4f',
                                fontSize: 14,
                                fontWeight: 500,
                                textAlign: 'center',
                              }}
                            />
                          )}
                          <ButtonComponent
                            onClick={() => handleDetaisOrder(list?._id)}
                            size={40}
                            styleButton={{
                              backgroundColor: 'blue',
                              border: '1px solid #1890ff',
                              borderRadius: 6,
                              height: 36,
                              padding: '0 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '100px',
                            }}
                            textButton="Xem chi tiết"
                            // styleTextButton={{
                            //   color: '#fff',
                            //   fontSize: 14,
                            //   fontWeight: 500,
                            //   textAlign: 'center',
                            // }}
                          />
                        </div>
                      </WrapperFooterItem>
                    </OrderCard>
                  ))
                ) : (
                  <EmptyOrders>
                    Không có đơn hàng nào.
                  </EmptyOrders>
                )}
              </WrapperListOrder>
            </div>
          </div>
        </OrderContainer>

        {/* Modal chọn lý do huỷ */}
        <Modal
          title="Chọn lý do huỷ đơn hàng"
          open={showCancelModal}
          onOk={handleConfirmCancel}
          onCancel={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
            setCancelReason('');
          }}
          okText="Xác nhận huỷ"
          cancelText="Thoát"
        >
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn lý do huỷ đơn hàng"
            value={cancelReason}
            onChange={(value) => setCancelReason(value)}
          >
            <Option value="Thay đổi ý định">Thay đổi ý định</Option>
            <Option value="Đặt nhầm">Đặt nhầm</Option>
            <Option value="Tìm được giá tốt hơn">Tìm được giá tốt hơn</Option>
            <Option value="Khác">Khác</Option>
          </Select>
        </Modal>
      </WrapperContainer>
    </Loading>
  );
};

export default MyOrderPage;
