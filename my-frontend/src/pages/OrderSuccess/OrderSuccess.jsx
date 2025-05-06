import React from 'react';
import { WrapperContainer, WrapperValue, WrapperItemOrder, WrapperInfo, WrapperItemOrderInfo, ButtonDetail } from './style';
import { useDispatch, useSelector } from 'react-redux';
import convertPrice from '../../utils';
import Loading from '../../components/LoadingComponent/Loading';
import { Label } from './style';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderContant } from '../../contant';
import { useQuery } from '@tanstack/react-query';
import * as OrderService from '../../service/OrderService'


const OrderSuccess = () => {
  const order = useSelector((state) => state.order)
  const location = useLocation()
  const {state} = location
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



  return (
    <div style={{ background: '#f5f5fa', width: '100%', minHeight: '100vh', padding: '24px 0' }}>
      <Loading isPending={false}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>🎉 Đặt hàng thành công</h2>
  
          <WrapperContainer>
            <WrapperInfo>
              <Label>Phương thức giao hàng</Label>
              <WrapperValue>
                {orderContant.delivery[state?.delivery]}
              </WrapperValue>
            </WrapperInfo>
  
            <WrapperInfo>
              <Label>Phương thức thanh toán</Label>
              <WrapperValue>
                {orderContant.payment[state?.payment]}
              </WrapperValue>
            </WrapperInfo>
  
            <WrapperItemOrderInfo>
              {state.orders?.map((order) => (
                <WrapperItemOrder key={order?.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={order.image} alt="product" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{order?.name}</div>
                      <div style={{ fontSize: '13px', color: '#444' }}>
                        Giá: {convertPrice(order?.price)} — SL: {order?.amount}
                      </div>
                    </div>
                  </div>
                </WrapperItemOrder>
              ))}
            </WrapperItemOrderInfo>
  
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <span style={{ fontSize: '18px', color: '#fe3834', fontWeight: 600 }}>
                Tổng tiền: {convertPrice(state?.totalPriceMemo)}
              </span>
            </div>
            <ButtonDetail
              onClick = {() => handleDetaisOrder(data?._id)}
            >
              Xem chi tiết đơn hàng
            </ButtonDetail>

          </WrapperContainer>
        </div>
      </Loading>
    </div>
  );

};   

export default OrderSuccess;
