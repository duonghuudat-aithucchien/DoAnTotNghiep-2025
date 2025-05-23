// import React, { useMemo, useState } from 'react';
// import {
//   WrapperHeaderUser,
//   WrapperInfoUser,
//   WrapperContentInfo,
//   WrapperLabel,
//   WrapperStyleContent,
//   WrapperItemLabel,
//   WrapperProduct,
//   WrapperNameProduct,
//   WrapperItem,
//   WrapperAllPrice,
//   WrapperFooter,
//   WrapperActions,
//   PageContainer,
//   PageTitle,
//   OrderSection,
//   ProductHeader,
//   PriceRow,
//   PriceLabel,
//   PriceValue,
//   OrderStatus,
//   OrderStatusBadge,
//   WrapperReviewSection,
//   WrapperReviewProduct,
// } from './style';
// import { useLocation, useParams } from 'react-router-dom';
// import * as OrderService from '../../service/OrderService';
// import * as ProductService from '../../service/ProductService';
// import { useQuery } from '@tanstack/react-query';
// import { orderContant } from '../../contant';
// import convertPrice from '../../utils';
// import Loading from '../../components/LoadingComponent/Loading';
// import { toast } from 'react-toastify';

// const DetailsOrderPage = () => {
//   const params = useParams();
//   const { id } = params;
//   const location = useLocation();
//   const { state } = location;

//   const [reviews, setReviews] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState({});

//   const fetchDetailsOrder = async () => {
//     const res = await OrderService.getDetailsOrder(id, state?.token);
//     return res.data;
//   };

//   const queryOrder = useQuery({
//     queryKey: ['orders-details'],
//     queryFn: fetchDetailsOrder,
//     enabled: Boolean(id),
//   });

//   const { isPending, data } = queryOrder;

//   const priceMemo = useMemo(() => {
//     const result = data?.orderItems?.reduce((total, cur) => {
//       return total + cur.price * cur.amount;
//     }, 0);
//     return result;
//   }, [data]);

//   const totalDiscount = useMemo(() => {
//     const result = data?.orderItems?.reduce((total, cur) => {
//       return total + (cur.discount ? (cur.price * cur.amount * cur.discount) / 100 : 0);
//     }, 0);
//     return result || 0;
//   }, [data]);

//   const orderStatus = data?.isDelivered ? 'Đã giao hàng' : 'Đang xử lý';
//   const paymentStatus = data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

//   const updateReview = (productId, field, value) => {
//     setReviews((prev) => ({
//       ...prev,
//       [productId]: {
//         ...prev[productId] || {},
//         [field]: value,
//       },
//     }));
//   };

//   const handleAddReview = async (productId, rating, comment) => {
//     if (!state?.token) {
//       setMessage((prev) => ({
//         ...prev,
//         [productId]: 'Vui lòng đăng nhập để gửi đánh giá',
//       }));
//       return;
//     }

//     if (!rating || rating < 1 || rating > 5) {
//       setMessage((prev) => ({
//         ...prev,
//         [productId]: 'Đánh giá phải từ 1 đến 5',
//       }));
//       return;
//     }

//     if (!comment || comment.trim() === '') {
//       setMessage((prev) => ({
//         ...prev,
//         [productId]: 'Bình luận không được để trống',
//       }));
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       const response = await ProductService.addReview(productId, Number(rating), comment, state?.token);
//       if (response.status === 'OK') {
//         setMessage((prev) => ({
//           ...prev,
//           [productId]: 'Đánh giá đã được gửi thành công!',
//         }));
//         setReviews((prev) => ({
//           ...prev,
//           [productId]: { rating, comment, submitted: true },
//         }));
//         toast.success('Đánh giá đã được gửi thành công!'); // Thêm toast
//       } else {
//         setMessage((prev) => ({
//           ...prev,
//           [productId]: response.message,
//         }));
//         toast.error(response.message);
//       }
//     } catch (error) {
//       console.error('Error adding review:', error);
//       setMessage((prev) => ({
//         ...prev,
//         [productId]: 'Có lỗi xảy ra khi gửi đánh giá',
//       }));
//       toast.error('Có lỗi xảy ra khi gửi đánh giá');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Loading isPending={isPending}>
//       <PageContainer>
//         <OrderSection>
//           <PageTitle>Chi tiết đơn hàng #{id}</PageTitle>

//           <OrderStatus>
//             <OrderStatusBadge status={data?.isDelivered ? 'delivered' : 'processing'}>
//               {orderStatus}
//             </OrderStatusBadge>
//             <OrderStatusBadge status={data?.isPaid ? 'paid' : 'unpaid'}>
//               {paymentStatus}
//             </OrderStatusBadge>
//           </OrderStatus>

//           <WrapperHeaderUser>
//             <WrapperInfoUser>
//               <WrapperLabel>Địa chỉ người nhận</WrapperLabel>
//               <WrapperContentInfo>
//                 <div className="name-info">{data?.shippingAddress?.fullName}</div>
//                 <div className="address-info">
//                   <span>Địa chỉ: </span>
//                   {`${data?.shippingAddress?.address} ${data?.shippingAddress?.city}`}
//                 </div>
//                 <div className="phone-info">
//                   <span>Điện thoại: </span>
//                   {data?.shippingAddress?.phone}
//                 </div>
                
//               </WrapperContentInfo>
//             </WrapperInfoUser>

//             <WrapperInfoUser>
//               <WrapperLabel>Hình thức giao hàng</WrapperLabel>
//               <WrapperContentInfo>
//                 <div className="delivery-info">
//                   <span className="name-delivery">FAST</span> Giao hàng tiết kiệm
//                 </div>
//                 <div className="delivery-fee">
//                   <span>Phí vận chuyển:</span> {convertPrice(data?.shippingPrice)}
//                 </div>
//               </WrapperContentInfo>
//             </WrapperInfoUser>

//             <WrapperInfoUser>
//               <WrapperLabel>Hình thức thanh toán</WrapperLabel>
//               <WrapperContentInfo>
//                 <div className="payment-info">{orderContant.payment[data?.paymentMethod]}</div>
//                 <div className="status-payment">
//                   {data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
//                 </div>
//               </WrapperContentInfo>
//             </WrapperInfoUser>
//           </WrapperHeaderUser>

//           <WrapperStyleContent>
//             <ProductHeader>
//               <div className="product-column">Sản phẩm</div>
//               <WrapperItemLabel>Giá</WrapperItemLabel>
//               <WrapperItemLabel>Số lượng</WrapperItemLabel>
//               <WrapperItemLabel>Giảm giá</WrapperItemLabel>
//             </ProductHeader>

//             {data?.orderItems?.map((order, index) => (
//               <WrapperProduct key={index}>
//                 <WrapperNameProduct>
//                   <img src={order?.image} alt={order?.name} />
//                   <div>
//                     {order?.name}
//                     <div className="product-variant">
//                       {(order?.sizes || order?.colors) && (
//                         <>
//                           {order?.sizes && <span>Size: {order?.sizes}</span>}
//                           {order?.sizes && order?.colors && <span className="separator">|</span>}
//                           {order?.colors && <span>Màu: {order?.colors}</span>}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </WrapperNameProduct>
//                 <WrapperItem>{convertPrice(order?.price)}</WrapperItem>
//                 <WrapperItem>{order?.amount}</WrapperItem>
//                 <WrapperItem>{order?.discount ? `${order?.discount}%` : '0%'}</WrapperItem>
//               </WrapperProduct>
//             ))}

//             <PriceRow>
//               <PriceLabel>Tạm tính</PriceLabel>
//               <PriceValue>{convertPrice(priceMemo)}</PriceValue>
//             </PriceRow>

//             {totalDiscount > 0 && (
//               <PriceRow>
//                 <PriceLabel>Giảm giá</PriceLabel>
//                 <PriceValue discount>- {convertPrice(totalDiscount)}</PriceValue>
//               </PriceRow>
//             )}

//             <PriceRow>
//               <PriceLabel>Phí vận chuyển</PriceLabel>
//               <PriceValue>{convertPrice(data?.shippingPrice)}</PriceValue>
//             </PriceRow>

//             <PriceRow total>
//               <PriceLabel>Tổng cộng</PriceLabel>
//               <PriceValue total>{convertPrice(data?.totalPrice)}</PriceValue>
//             </PriceRow>
//           </WrapperStyleContent>

//           <WrapperFooter>
//             <div>
//               <div className="order-date">
//                 Ngày đặt hàng:{' '}
//                 {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
//               </div>
//             </div>
//             <WrapperActions>
//               <button>In hóa đơn</button>
//               <button>Liên hệ hỗ trợ</button>
//             </WrapperActions>
//           </WrapperFooter>

//           {data?.isDelivered ? (
//             <WrapperReviewSection>
//               <h3>Đánh giá sản phẩm</h3>
//               {data?.orderItems?.map((order, index) => (
//                 <WrapperReviewProduct key={index}>
//                   <div className="product-info">
//                     <img src={order?.image} alt={order?.name} />
//                     <div>
//                       <div className="product-name">{order?.name}</div>
//                       <div className="product-variant">
//                         {order?.sizes && <span>Size: {order?.sizes}</span>}
//                         {order?.sizes && order?.colors && <span className="separator">|</span>}
//                         {order?.colors && <span>Màu: {order?.colors}</span>}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="review-form">
//                     {message[order.product] && (
//                       <p style={{ color: message[order.product].includes('thành công') ? 'green' : 'red' }}>
//                         {message[order.product]}
//                       </p>
//                     )}
//                     {!reviews[order.product]?.submitted ? (
//                       <>
//                         <input
//                           type="number"
//                           min="1"
//                           max="5"
//                           placeholder="Đánh giá (1-5)"
//                           value={reviews[order.product]?.rating || ''}
//                           onChange={(e) => {
//                             const value = e.target.value ? Number(e.target.value) : '';
//                             if (value === '' || (value >= 1 && value <= 5)) {
//                               updateReview(order.product, 'rating', value);
//                             }
//                           }}
//                         />
//                         <textarea
//                           placeholder="Nhập đánh giá của bạn"
//                           value={reviews[order.product]?.comment || ''}
//                           onChange={(e) => updateReview(order.product, 'comment', e.target.value)}
//                         />
//                         <button
//                           disabled={isSubmitting || !reviews[order.product]?.rating || !reviews[order.product]?.comment}
//                           onClick={() =>
//                             handleAddReview(
//                               order.product,
//                               reviews[order.product]?.rating,
//                               reviews[order.product]?.comment
//                             )
//                           }
//                         >
//                           {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
//                         </button>
//                       </>
//                     ) : (
//                       <p>Đã gửi đánh giá cho sản phẩm này</p>
//                     )}
//                   </div>
//                 </WrapperReviewProduct>
//               ))}
//             </WrapperReviewSection>
//           ) : (
//             <p>Đơn hàng chưa được giao, không thể đánh giá.</p>
//           )}
//         </OrderSection>
//       </PageContainer>
//     </Loading>
//   );
// };

// export default DetailsOrderPage;

// Ví dụ minh họa cách tích hợp component ReviewSection vào DetailsOrderPage

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
  WrapperFooter,
  WrapperActions,
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

const DetailsOrderPage = () => {
  const params = useParams();
  const { id } = params;
  const location = useLocation();
  const { state } = location;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetailsOrder = async () => {
    const res = await OrderService.getDetailsOrder(id, state?.token);
    return res.data;
  };

  const queryOrder = useQuery({
    queryKey: ['orders-details'],
    queryFn: fetchDetailsOrder,
    enabled: Boolean(id),
  });

  const { isPending, data } = queryOrder;

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

  const orderStatus = data?.isDelivered ? 'Đã giao hàng' : 'Đang xử lý';
  const paymentStatus = data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

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
            <OrderStatusBadge status={data?.isDelivered ? 'delivered' : 'processing'}>
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

          {/* <WrapperFooter>
            <div>
              <div className="order-date">
                Ngày đặt hàng:{' '}
                {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
            </div>
            <WrapperActions>
              <button>In hóa đơn</button>
              <button>Liên hệ hỗ trợ</button>
            </WrapperActions>
          </WrapperFooter> */}

          <ReviewSection 
            orderItems={data?.orderItems} 
            isDelivered={data?.isDelivered}
            onAddReview={handleAddReview}
            isSubmitting={isSubmitting}
            authToken={state?.token}
          />
        </OrderSection>
      </PageContainer>
    </Loading>
  );
};

export default DetailsOrderPage;