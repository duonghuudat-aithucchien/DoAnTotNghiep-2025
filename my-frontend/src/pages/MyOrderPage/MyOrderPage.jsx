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
  PaginationWrapper,
  PageHeader,
  OrderCard,
  ProductsList,
  OrderContainer
} from './style';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { convertPrice } from '../../utils';
import { message, Pagination, Divider, Tag } from 'antd';
import { useMutationHooks } from '../../hooks/useMutationHook';

const MyOrderPage = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const handleDetaisOrder = (id) => {
    navigate(`/details-order/${id}`, {
      state: {
        token: state?.token,
      },
    });
  };

  const mutation = useMutationHooks((data) => {
    const { id, token, orderItems } = data;
    const res = OrderService.cancelOrder(id, token, orderItems);
    return res;
  });

  const handleCancleOrder = (list) => {
    mutation.mutate(
      { id: list._id, token: state?.token, orderItems: list?.orderItems },
      {
        onSuccess: () => {
          queryOrder.refetch();
        },
      }
    );
  };

  const { isPending: isPendingCancle, isSuccess: isSuccessCancle, isError: isErrorCancle, data: dataCancle } = mutation;

  useEffect(() => {
    if (isSuccessCancle && dataCancle?.status === 'OK') {
      message.success('Huỷ đơn hàng thành công!');
    } else if (isErrorCancle) {
      message.error('Huỷ đơn hàng thất bại!');
    }
  }, [isErrorCancle, isSuccessCancle, dataCancle]);

  // Tính toán các đơn hàng cần hiển thị trên trang hiện tại
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
            {/* Header với Tiêu đề và phân trang */}
            <PageHeader>
              <h2>Đơn hàng của tôi</h2>
              
              {/* Phân trang ở trên */}
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

            {/* Danh sách đơn hàng */}
            <div style={{ padding: '8px 16px', backgroundColor: '#f9f9f9' }}>
              <WrapperListOrder>
                {Array.isArray(currentOrders) && currentOrders.length > 0 ? (
                  currentOrders.map((list, index) => (
                    <OrderCard key={list._id} isLast={index === currentOrders.length - 1}>
                      {/* Header của đơn hàng */}
                      <OrderHeader>
                        <div className="order-id">
                          <span className="id-label" style={{ fontSize: 18 }}>Mã đơn:</span>
                          <span className="id-value" style={{ fontSize: 18 }}>
                            {list?._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <WrapperStatus>
                          <Tag color={list?.isDelivered ? 'green' : 'volcano'}>
                            {list?.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng'}
                          </Tag>
                          <Tag color={list?.isPaid ? 'green' : 'gold'}>
                            {list?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Tag>
                        </WrapperStatus>
                      </OrderHeader>

                      {/* Danh sách sản phẩm */}
                      <ProductsList>
                        {list?.orderItems?.map((order, idx) => (
                          <div key={order._id}>
                            <WrapperHeaderItem>
                              <img
                                src={order?.image}
                                alt={order?.name}
                              />
                              <div className="product-info-container" style={{ flex: 1 }}>
                                <div className="product-info">{order?.name}</div>
                                <div className="product-meta">
                                  {order?.sizes && (
                                    <span>Size: {order?.sizes}</span>
                                  )}
                                  {order?.colors && (
                                    <span>Màu: {order?.colors}</span>
                                  )}
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

                      {/* Footer của đơn hàng */}
                      <WrapperFooterItem>
  <div>
    <span className="total-label" style={{ fontSize: 18 }}>Tổng tiền:</span>
    <span className="total-price" style={{ fontSize: 18 }}>
      {convertPrice(list?.totalPrice)}
    </span>
  </div>
  <div className="actions" style={{ display: 'flex', gap: '12px' }}>
    {/* Hiển thị nút "Huỷ đơn hàng" nếu đơn hàng chưa giao và chưa thanh toán */}
    {!list?.isDelivered && !list?.isPaid && (
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
      styleTextButton={{
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
        textAlign: 'center',
      }}
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

            {/* Phân trang ở dưới */}
            {/* {Array.isArray(data) && data.length > itemsPerPage && (
              <PaginationWrapper>
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={data.length}
                  onChange={handlePageChange}
                />
              </PaginationWrapper>
            )} */}
          </div>
        </OrderContainer>
      </WrapperContainer>
    </Loading>
  );
};

export default MyOrderPage;


