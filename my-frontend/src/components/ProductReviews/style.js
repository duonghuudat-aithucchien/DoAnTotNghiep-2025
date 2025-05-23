import styled from 'styled-components';

export const ReviewsContainer = styled.div`
  width: 100%;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

export const ReviewsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
`;

export const HeaderTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #222;
  
  span {
    color: #888;
    font-weight: normal;
    margin-left: 5px;
  }
`;

export const ReviewStatsContainer = styled.div`
  display: flex;
  margin-bottom: 32px;
  background: #f9f9fc;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const AverageRating = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 40px;
  padding-right: 30px;
  border-right: 1px solid #eee;
  min-width: 150px;
  
  > div {
    margin: 10px 0;
  }
  
  > span {
    font-size: 13px;
    color: #777;
  }
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
    padding-right: 0;
  }
`;

export const RatingNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #222;
`;

export const ReviewStats = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

export const StatLabel = styled.div`
  min-width: 50px;
  font-size: 14px;
  color: #555;
`;

export const StatBar = styled.div`
  flex: 1;
  height: 8px;
  background: #eaeaea;
  border-radius: 4px;
  margin: 0 10px;
  overflow: hidden;
`;

export const StatFill = styled.div`
  height: 100%;
  background: #FFB800;
  border-radius: 4px;
  width: ${props => props.width || 0}%;
`;

export const StatNumber = styled.div`
  min-width: 25px;
  font-size: 13px;
  color: #777;
`;

export const ReviewsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ReviewCard = styled.div`
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

export const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const ReviewerInfo = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const ReviewerName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #222;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: #E7F7E8;
  color: #2E7D32;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  
  svg {
    margin-right: 3px;
  }
`;

export const ReviewerAvatar = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  
  img.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ReviewRating = styled.div`
  display: flex;
  margin-bottom: 2px;

  svg {
    margin-right: 2px;
  }
`;

export const ReviewBodyContainer = styled.div`
  margin-bottom: 16px;
`;

export const ReviewContent = styled.p`
  color: #333;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
  word-break: break-word;
`;

export const ReviewDate = styled.div`
  color: #888;
  font-size: 12px;
  white-space: nowrap;
`;

export const ReviewFooter = styled.div`
  display: flex;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

export const LikeButton = styled.button`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 10px;
  color: #555;
  
  &:hover {
    background: #eaeaea;
  }
  
  svg {
    margin-right: 5px;
  }
`;

export const LikeCount = styled.div`
  font-size: 12px;
  color: #888;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  p {
    margin-top: 16px;
    color: #666;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const NoReviews = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  color: #888;
  
  p {
    margin-top: 16px;
  }
  
  svg {
    color: #ccc;
  }
`;