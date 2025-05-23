import React, { useState } from 'react';
import { 
  WrapperReviewSection,
  WrapperReviewProduct,
  ProductReviewInfo,
  ProductImage,
  ProductDetails,
  ProductName,
  ProductVariant,
  ReviewFormContainer,
  ReviewMessage,
  RatingContainer,
  RatingStars,
  RatingStar,
  ReviewTextarea,
  SubmitButton,
  ReviewSubmitted,
  ReviewSubmittedIcon,
  ReviewSubmittedText,
  Separator,
  ReviewFormTitle,
  ReviewFormSubtitle
} from './ReviewSectionStyle';

const ReviewSection = ({ orderItems = [], isDelivered, onAddReview, isSubmitting, authToken }) => {
  const [reviews, setReviews] = useState({});
  const [message, setMessage] = useState({});

  // Xử lý khi người dùng chọn số sao đánh giá
  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId] || {},
        rating
      }
    }));
  };

  // Xử lý khi người dùng nhập nội dung đánh giá
  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId] || {},
        comment
      }
    }));
  };

  // Xử lý khi người dùng gửi đánh giá
  const handleSubmitReview = async (productId) => {
    const rating = reviews[productId]?.rating;
    const comment = reviews[productId]?.comment;

    if (!authToken) {
      setMessage(prev => ({
        ...prev,
        [productId]: { text: 'Vui lòng đăng nhập để gửi đánh giá', type: 'error' }
      }));
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setMessage(prev => ({
        ...prev,
        [productId]: { text: 'Vui lòng chọn số sao đánh giá (1-5)', type: 'error' }
      }));
      return;
    }

    if (!comment || comment.trim() === '') {
      setMessage(prev => ({
        ...prev,
        [productId]: { text: 'Vui lòng nhập nội dung đánh giá', type: 'error' }
      }));
      return;
    }

    try {
      const result = await onAddReview(productId, rating, comment);
      if (result.success) {
        setMessage(prev => ({
          ...prev,
          [productId]: { text: 'Đánh giá đã được gửi thành công!', type: 'success' }
        }));
        setReviews(prev => ({
          ...prev,
          [productId]: { ...prev[productId], submitted: true }
        }));
      } else {
        setMessage(prev => ({
          ...prev,
          [productId]: { text: result.message || 'Có lỗi xảy ra khi gửi đánh giá', type: 'error' }
        }));
      }
    } catch (error) {
      setMessage(prev => ({
        ...prev,
        [productId]: { text: 'Có lỗi xảy ra khi gửi đánh giá', type: 'error' }
      }));
    }
  };

  // Render số sao đánh giá
  const renderRatingStars = (productId) => {
    const currentRating = reviews[productId]?.rating || 0;
    
    return (
      <RatingStars>
        {[1, 2, 3, 4, 5].map(star => (
          <RatingStar 
            key={star}
            selected={star <= currentRating}
            onClick={() => handleRatingChange(productId, star)}
            disabled={reviews[productId]?.submitted || isSubmitting}
          >
            ★
          </RatingStar>
        ))}
      </RatingStars>
    );
  };

  if (!isDelivered) {
    return null;
  }

  return (
    <WrapperReviewSection>
      <ReviewFormTitle>Đánh giá sản phẩm</ReviewFormTitle>
      <ReviewFormSubtitle>Hãy chia sẻ trải nghiệm của bạn về sản phẩm</ReviewFormSubtitle>
      
      {orderItems.map((item, index) => (
        <WrapperReviewProduct key={index}>
          <ProductReviewInfo>
            <ProductImage src={item?.image} alt={item?.name} />
            <ProductDetails>
              <ProductName>{item?.name}</ProductName>
              <ProductVariant>
                {item?.sizes && <span>Size: {item?.sizes}</span>}
                {item?.sizes && item?.colors && <Separator>|</Separator>}
                {item?.colors && <span>Màu: {item?.colors}</span>}
              </ProductVariant>
            </ProductDetails>
          </ProductReviewInfo>

          <ReviewFormContainer>
            {message[item.product] && (
              <ReviewMessage type={message[item.product].type}>
                {message[item.product].text}
              </ReviewMessage>
            )}

            {!reviews[item.product]?.submitted ? (
              <>
                <RatingContainer>
                  <span>Đánh giá của bạn:</span>
                  {renderRatingStars(item.product)}
                </RatingContainer>
                
                <ReviewTextarea
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  value={reviews[item.product]?.comment || ''}
                  onChange={(e) => handleCommentChange(item.product, e.target.value)}
                  disabled={isSubmitting}
                />
                
                <SubmitButton
                  disabled={isSubmitting || !reviews[item.product]?.rating || !reviews[item.product]?.comment}
                  onClick={() => handleSubmitReview(item.product)}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </SubmitButton>
              </>
            ) : (
              <ReviewSubmitted>
                <ReviewSubmittedIcon>✓</ReviewSubmittedIcon>
                <ReviewSubmittedText>Cảm ơn bạn đã gửi đánh giá!</ReviewSubmittedText>
              </ReviewSubmitted>
            )}
          </ReviewFormContainer>
        </WrapperReviewProduct>
      ))}
    </WrapperReviewSection>
  );
};

export default ReviewSection;