import styled from 'styled-components';

export const WrapperReviewSection = styled.div`
  margin-top: 24px;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: -4px;
    left: 24px;
    right: 24px;
    height: 4px;
    background: linear-gradient(90deg, #0b74e5, #36a2eb);
    border-radius: 4px 4px 0 0;
  }
`;

export const ReviewFormTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  position: relative;
  display: inline-block;
`;

export const ReviewFormSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
`;

export const WrapperReviewProduct = styled.div`
  display: flex;
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    border-color: #e0e0e0;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ProductReviewInfo = styled.div`
  display: flex;
  flex: 1;
  padding-right: 24px;
  border-right: 1px solid #f0f0f0;
  
  @media (max-width: 768px) {
    padding-right: 0;
    border-right: none;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
`;

export const ProductImage = styled.img`
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #f0f0f0;
  background-color: #fff;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

export const ProductDetails = styled.div`
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
`;

export const ProductVariant = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
`;

export const Separator = styled.span`
  margin: 0 6px;
  color: #ddd;
`;

export const ReviewFormContainer = styled.div`
  flex: 1.5;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

export const ReviewMessage = styled.div`
  font-size: 14px;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  
  ${props => {
    if (props.type === 'success') {
      return `
        background-color: #e6f7ed;
        color: #0a8043;
        border-left: 4px solid #0a8043;
      `;
    } else if (props.type === 'error') {
      return `
        background-color: #feeaeb;
        color: #e53e3e;
        border-left: 4px solid #e53e3e;
      `;
    }
  }}
  
  &:before {
    content: ${props => props.type === 'success' ? '"✓"' : '"!"'};
    font-weight: bold;
    margin-right: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.type === 'success' ? '#0a8043' : '#e53e3e'};
    color: white;
    font-size: 12px;
  }
`;

export const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  span {
    font-size: 14px;
    font-weight: 500;
    color: #555;
    margin-right: 12px;
  }
`;

export const RatingStars = styled.div`
  display: flex;
`;

export const RatingStar = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.selected ? '#ffb700' : '#d1d1d1'};
  transition: all 0.2s ease;
  padding: 0 3px;
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.2)'};
    color: ${props => props.disabled ? props.selected ? '#ffb700' : '#d1d1d1' : '#ffb700'};
  }
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    cursor: default;
  }
`;

export const ReviewTextarea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  resize: none;
  margin-bottom: 16px;
  transition: border-color 0.2s ease;
  font-family: inherit;
  
  &:focus {
    border-color: #0b74e5;
    outline: none;
    box-shadow: 0 0 0 2px rgba(11, 116, 229, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
  }
  
  &:disabled {
    background-color: #f9f9f9;
    cursor: not-allowed;
  }
`;

export const SubmitButton = styled.button`
  align-self: flex-end;
  padding: 10px 24px;
  border-radius: 6px;
  background-color: #0b74e5;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background-color: #0861c5;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(11, 116, 229, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }
  
  &:disabled {
    background-color: #a5c8f0;
    cursor: not-allowed;
  }
`;

export const ReviewSubmitted = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #d9e1e7;
`;

export const ReviewSubmittedIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0a8043;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(10, 128, 67, 0.2);
`;

export const ReviewSubmittedText = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #0a8043;
  text-align: center;
  margin: 0;
`;

export default {};