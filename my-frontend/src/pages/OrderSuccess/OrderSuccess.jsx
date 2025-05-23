import React, { useEffect, useState } from 'react';
import { WrapperContainer, WrapperValue, WrapperItemOrder, WrapperInfo, WrapperItemOrderInfo, ButtonDetail } from './style';
import { useDispatch, useSelector } from 'react-redux';
import convertPrice from '../../utils';
import Loading from '../../components/LoadingComponent/Loading';
import { Label } from './style';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderContant } from '../../contant';
import { useQuery } from '@tanstack/react-query';
import * as OrderService from '../../service/OrderService'
import { useMutationHooks } from '../../hooks/useMutationHook';
import { message, Pagination, Divider, Tag } from 'antd';


const OrderSuccess = () => {
  // const order = useSelector((state) => state.order)
  // const location = useLocation()
  // const {state} = location
  // const navigate = useNavigate()

  // const fetchMyOrder = async () => {
  //   const res = await OrderService.getOrderbyUserId(state?.id, state?.token)
  //   return res.data
  // }

  // const queryOrder = useQuery({
  //   queryKey: ['users'],
  //   queryFn: fetchMyOrder,
  //   enabled: Boolean(state?.id && state?.token)
  // });

  // const { isPending, data } = queryOrder;

  // const handleDetaisOrder = (id) => {
  //   navigate(`/details-order/${id}`, {
  //     state: {
  //       token: state?.token
  //     }
  //   })
  // }

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
    if (!id) {
        console.error("Order ID is missing!"); // Log lỗi nếu không có ID
        return;
    }

    navigate(`/details-order/${id}`, {
        state: {
            token: state?.token, // Truyền token để xác thực
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
    <div style={{ 
      background: 'linear-gradient(to bottom, #f0f2f5, #ffffff)', 
      width: '100%', 
      minHeight: '100vh', 
      padding: '32px 16px' 
    }}>
      <Loading isPending={false}>
        <div style={{ 
          maxWidth: '960px', 
          margin: '0 auto',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)', 
          borderRadius: '16px',
          background: '#fff',
          overflow: 'hidden'
        }}>
          {/* Header Section */}
          <div style={{
            background: 'linear-gradient(135deg, #13c2c2, #1890ff)',
            padding: '32px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <span role="img" aria-label="check" style={{ fontSize: '36px' }}>✅</span>
            </div>
            <h2 style={{ 
              color: '#fff', 
              fontSize: '24px', 
              fontWeight: '600',
              marginBottom: '8px'
            }}>Đặt hàng thành công</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
              Cảm ơn bạn đã mua sắm cùng chúng tôi
            </p>
          </div>
          
          {/* Order Information Section */}
          <WrapperContainer style={{ padding: '24px' }}>
            {/* Delivery Method & Payment Method Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <WrapperInfo style={{ 
                background: '#f9f9f9', 
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #eaeaea'
              }}>
                <Label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#555',
                  fontSize: '14px'
                }}>Phương thức giao hàng</Label>
                <WrapperValue style={{ 
                  background: 'rgba(24, 144, 255, 0.1)',
                  border: '1px solid rgba(24, 144, 255, 0.2)',
                  color: '#1890ff',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 16px',
                  borderRadius: '8px'
                }}>
                  {orderContant.delivery[state?.delivery]}
                </WrapperValue>
              </WrapperInfo>
              
              <WrapperInfo style={{ 
                background: '#f9f9f9', 
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #eaeaea'
              }}>
                <Label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#555',
                  fontSize: '14px'
                }}>Phương thức thanh toán</Label>
                <WrapperValue style={{ 
                  background: 'rgba(82, 196, 26, 0.1)',
                  border: '1px solid rgba(82, 196, 26, 0.2)',
                  color: '#52c41a',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 16px',
                  borderRadius: '8px'
                }}>
                  {orderContant.payment[state?.payment]}
                </WrapperValue>
              </WrapperInfo>
            </div>
            
            {/* Order Items Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#333'
              }}>Chi tiết đơn hàng</h3>
              
              <WrapperItemOrderInfo style={{ 
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {state?.orders?.map((order, index) => (
                  <WrapperItemOrder key={order?.name + index} style={{ 
                    padding: '16px',
                    borderBottom: index < state.orders.length - 1 ? '1px solid #eaeaea' : 'none',
                    backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px' 
                    }}>
                      <img 
                        src={order.image} 
                        alt="product" 
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '1px solid #eaeaea'
                        }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: 600,
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {order?.name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#666'
                          }}>
                            Số lượng: <span style={{ fontWeight: 500 }}>{order?.amount}</span>
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 600,
                            color: '#1890ff'
                          }}>
                            {convertPrice(order?.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </WrapperItemOrder>
                ))}
              </WrapperItemOrderInfo>
            </div>
            
            {/* Total and Detail Button Section */}
            <div style={{ 
              padding: '20px', 
              background: '#f9f9f9',
              borderRadius: '12px',
              border: '1px solid #eaeaea'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px' 
              }}>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 500,
                  color: '#555' 
                }}>
                  Tổng tiền:
                </span>
                <span style={{ 
                  fontSize: '20px', 
                  color: '#f5222d', 
                  fontWeight: 700 
                }}>
                  {convertPrice(state?.totalPriceMemo)}
                </span>
              </div>
              
              {state?.orders?.map((order) => (
    <ButtonDetail
        key={order._id}
        onClick={() => handleDetaisOrder(order._id)} // Truyền id của từng đơn hàng
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
        Xem chi tiết đơn hàng
    </ButtonDetail>
))}
            </div>
            
            {/* Customer Support Note */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              fontSize: '14px',
              color: '#888'
            }}>
              <p>Nếu bạn có thắc mắc về đơn hàng, vui lòng liên hệ với chúng tôi.</p>
            </div>
          </WrapperContainer>
        </div>
      </Loading>
    </div>
  );
};   

export default OrderSuccess;