import React, { useEffect } from 'react';


import { useQuery } from '@tanstack/react-query';
import * as OrderService from '../../service/OrderService'
import Loading from '../../components/LoadingComponent/Loading';
import { useLocation, useNavigate } from 'react-router-dom';
import { WrapperContainer, WrapperFooterItem, WrapperHeaderItem, WrapperItemOrder, WrapperListOrder, WrapperStatus } from './style';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import {convertPrice} from '../../utils'
import { message } from 'antd';
import { useMutationHooks } from '../../hooks/useMutationHook'


const MyOrderPage = () => {
  const location = useLocation()
  const { state } = location
  const navigate = useNavigate()
  const fetchMyOrder = async () => {
    const res = await OrderService.getOrderbyUserId(state?.id, state?.token)
    return res.data
  } 
  const queryOrder = useQuery({
    queryKey: ['users'],
    queryFn: fetchMyOrder,
    enabled: Boolean(state?.id && state?.token)
  });
  
  const { isPending, data } = queryOrder;

  const handleDetaisOrder = (id) => {
    navigate(`/details-order/${id}`, {
      state: {
        token: state?.token
      }
    })
  }

  const mutation = useMutationHooks(
    (data) => {
      const { id, token, orderItems } = data
      const res = OrderService.cancelOrder(id, token, orderItems)
      return res
    }
  )

  const handleCancleOrder = (list) => {
    mutation.mutate({id: list._id, token: state?.token, orderItems: list?.orderItems}, {
      onSuccess: () => {
        queryOrder.refetch()
      }
    })
  }

  const { isPending: isPendingCancle, isSuccess: isSuccessCancle, isError: isErrorCancle, data: dataCancle } = mutation

  useEffect(() => {
    if(isSuccessCancle && dataCancle?.status === 'OK') {
      message.success()
    } else if (isErrorCancle) {
      message.error()
    }
  }, [isErrorCancle, isSuccessCancle, dataCancle])

  // const renderProduct = (data) => {
  //   return data?.map((order) => { 
  //     return <WrapperHeaderItem>
  //         <img
  //           src={order?.image}
  //           style={{
  //             width: '70px',
  //             height: '70px',
  //             objectFit: 'cover',
  //             border: '1px solid rgb(238, 238, 238)',
  //             padding: '2px',
  //           }}
  //         />
  //         <div
  //           style={{
  //             width: 260,
  //             overflow: 'hidden',
  //             textOverflow: 'ellipsis',
  //             whiteSpace: 'nowrap',
  //             marginLeft: '10px',
  //           }}
  //         >
  //           {order?.name}
  //         </div>
  //         <span style={{ fontSize: '13px', color: '#242424', marginLeft: 'auto' }}>
  //           {convertPrice(order?.price)}
  //         </span>
  //       </WrapperHeaderItem>
  //   })
  // }


  return (
    <Loading isPending={isPending || isPendingCancle}>
      <WrapperContainer>
        <div style={{ margin: '0 auto', width: '1270px', height: '100vh' }}>
          <h4>Đơn hàng của tôi</h4>
          <WrapperListOrder>
            {Array.isArray(data) ? (
              data.map((list) => {
                return list?.orderItems?.map((order) => {
                  return (
                    <WrapperItemOrder key={order?._id}>
                      <WrapperStatus>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Trạng thái</span>
                        <div>
                          <span style={{ color: 'rgb(255,66,78)' }}>Giao hàng: </span>
                          {`${order.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng'}`}
                        </div>
                        <div>
                          <span style={{ color: 'rgb(255,66,78)' }}>Thanh toán: </span>
                          {`${order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}`}
                        </div>
                      </WrapperStatus>
                      <WrapperHeaderItem>
                        <img
                          src={order?.image}
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'cover',
                            border: '1px solid rgb(238, 238, 238)',
                            padding: '2px',
                          }}
                        />
                        <div
                          style={{
                            width: 260,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginLeft: '10px',
                          }}
                        >
                          {order?.name}
                        </div>
                        <span style={{ fontSize: '13px', color: '#242424', marginLeft: 'auto' }}>
                          {convertPrice(order?.price)}
                        </span>
                      </WrapperHeaderItem>                      
                      <WrapperFooterItem>
                        <div>
                          <span style={{ color: 'rgb(255,66,78)' }}>Tổng tiền: </span>
                          <span style={{ fontSize: '14px', color: 'rgb(255,66,78)', fontWeight: 700 }}>
                            {convertPrice(list?.totalPrice)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <ButtonComponent
                          onClick={() => handleCancleOrder(list)}
                            size={40}
                            styleButton={{
                              height: '36px',
                              border: '1px solid rgb(11, 116, 229)',
                              borderRadius: '4px',
                            }}
                            textButton={'Huỷ đơn hàng'}
                            styleTextButton={{ color: 'rgb(11, 116, 229)', fontSize: '14px' }}
                          ></ButtonComponent>
                          <ButtonComponent
                            onClick = {() => handleDetaisOrder(list?._id)}
                            size={40}
                            styleButton={{
                              height: '36px',
                              border: '1px solid rgb(11, 116, 229)',
                              borderRadius: '4px',
                            }}
                            textButton={'Xem chi tiết'}
                            styleTextButton={{ color: 'rgb(11, 116, 229)', fontSize: '14px' }}
                          ></ButtonComponent>
                        </div>
                      </WrapperFooterItem>
                    </WrapperItemOrder>
                  );
                });
              })
            ) : (
              <div>Không có đơn hàng nào.</div>
            )}
          </WrapperListOrder>
        </div>
      </WrapperContainer>
    </Loading>
  );
};   

export default MyOrderPage;
