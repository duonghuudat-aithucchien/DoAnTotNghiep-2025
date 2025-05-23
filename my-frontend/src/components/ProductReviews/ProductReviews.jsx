import React, { useEffect, useState } from 'react';
import { getReviews } from '../../service/ProductService';
import {
  ReviewsContainer,
  ReviewsHeader,
  HeaderTitle,
  ReviewsList,
  ReviewCard,
  ReviewHeader,
  ReviewerName,
  ReviewerAvatar,
  ReviewRating,
  ReviewContent,
  ReviewDate,
  NoReviews,
  LoadingContainer,
  ReviewStatsContainer,
  ReviewStats,
  StatLabel,
  StatNumber,
  StatBar,
  StatFill,
  AverageRating,
  RatingNumber,
  ReviewFooter,
  LikeButton,
  LikeCount,
  ReviewBodyContainer,
  ReviewerInfo,
  VerifiedBadge
} from './style';
import { Star, ThumbsUp, Loader, MessageSquare, Award } from 'lucide-react';
import { UserOutlined } from '@ant-design/icons';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingStats, setRatingStats] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      const response = await getReviews(productId);
      if (response.status === 'OK') {
        setReviews(response.data);
        
        // Calculate average rating and stats
        if (response.data.length > 0) {
          const total = response.data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating((total / response.data.length).toFixed(1));
          
          // Calculate rating distribution
          const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          response.data.forEach(review => {
            stats[review.rating] = (stats[review.rating] || 0) + 1;
          });
          setRatingStats(stats);
        }
      } else {
        console.error('Failed to fetch reviews:', response.message);
      }
      setIsLoading(false);
    };

    fetchReviews();
  }, [productId]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < rating ? "#FFB800" : "#EEEEEE"}
          stroke={i < rating ? "#FFB800" : "#EEEEEE"}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader size={24} className="animate-spin" />
        <p>Đang tải đánh giá...</p>
      </LoadingContainer>
    );
  }

  if (reviews.length === 0) {
    return (
      <NoReviews>
        <MessageSquare size={40} />
        <p>Không có đánh giá nào cho sản phẩm này</p>
      </NoReviews>
    );
  }

  // Calculate percentage for each rating
  const getPercentage = (ratingCount) => {
    return (ratingCount / reviews.length) * 100;
  };

  return (
    <ReviewsContainer>
      <ReviewsHeader>
        <HeaderTitle>Tất cả đánh giá <span>({reviews.length})</span></HeaderTitle>
      </ReviewsHeader>

      <ReviewStatsContainer>
        <AverageRating>
          <RatingNumber>{averageRating}</RatingNumber>
          <div>{renderStars(Math.round(averageRating))}</div>
          <span>{reviews.length} đánh giá</span>
        </AverageRating>
        
        <div>
          {[5, 4, 3, 2, 1].map(rating => (
            <ReviewStats key={rating}>
              <StatLabel>{rating} sao</StatLabel>
              <StatBar>
                <StatFill width={getPercentage(ratingStats[rating])} />
              </StatBar>
              <StatNumber>{ratingStats[rating]}</StatNumber>
            </ReviewStats>
          ))}
        </div>
      </ReviewStatsContainer>

      <ReviewsList>
        {reviews.map((review, index) => (
          <ReviewCard key={index}>
            <ReviewHeader>
              <ReviewerInfo>
                <ReviewerAvatar>
                  {review.user?.avatar ? (
                    <img
                      src={review.user?.avatar}
                      alt={review.user?.name || 'User'}
                      className="avatar"
                    />
                  ) : (
                    <UserOutlined style={{ fontSize: '20px' }} />
                  )}
                </ReviewerAvatar>
                <div>
                  <ReviewerName>
                    {review.user?.name || 'Ẩn danh'}
                    {review.verified && (
                      <VerifiedBadge>
                        <Award size={12} />
                        Đã xác nhận mua hàng
                      </VerifiedBadge>
                    )}
                  </ReviewerName>
                  <ReviewRating>
                    {renderStars(review.rating)}
                  </ReviewRating>
                </div>
              </ReviewerInfo>
              <ReviewDate>Đăng vào {formatDate(review.createdAt)}</ReviewDate>
            </ReviewHeader>
            
            <ReviewBodyContainer>
              <ReviewContent>"{review.comment}"</ReviewContent>
            </ReviewBodyContainer>
            
            <ReviewFooter>
              <LikeButton>
                <ThumbsUp size={14} /> Hữu ích
              </LikeButton>
              <LikeCount>{Math.floor(Math.random() * 10)} người thấy hữu ích</LikeCount>
            </ReviewFooter>
          </ReviewCard>
        ))}
      </ReviewsList>
    </ReviewsContainer>
  );
};

export default ProductReviews;