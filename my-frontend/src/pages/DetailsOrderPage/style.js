import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f5f5fa;
  padding: 20px 0;
`;

export const OrderSection = styled.div`
  width: 1270px;
  max-width: 95%;
  margin: 0 auto;
`;

export const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

export const OrderStatus = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

export const OrderStatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  
  ${props => {
    if (props.status === 'delivered') {
      return `
        background-color: #e6f7ed;
        color: #0a8043;
      `;
    } else if (props.status === 'processing') {
      return `
        background-color: #fef3e8;
        color: #d35400;
      `;
    } else if (props.status === 'paid') {
      return `
        background-color: #e8f4fd;
        color: #0b74e5;
      `;
    } else if (props.status === 'unpaid') {
      return `
        background-color: #feeaeb;
        color: #e53e3e;
      `;
    }
  }}
`;

export const WrapperHeaderUser = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  gap: 20px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

export const WrapperInfoUser = styled.div`
  flex: 1;
  min-width: 250px;
  
  &:not(:last-child) {
    border-right: 1px solid #f0f0f0;
    padding-right: 20px;
  }
  
  @media (max-width: 992px) {
    &:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid #f0f0f0;
      padding-right: 0;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
  }
`;

export const WrapperLabel = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: #0b74e5;
  }
`;

export const WrapperContentInfo = styled.div`
  font-size: 14px;
  color: #555;
  line-height: 1.6;

  .name-info {
    font-weight: 600;
    font-size: 15px;
    color: #333;
    margin-bottom: 8px;
  }

  .address-info,
  .phone-info {
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    
    span {
      font-weight: 500;
      color: #666;
    }
  }

  .delivery-info {
    margin-bottom: 8px;
    
    .name-delivery {
      font-weight: 600;
      color: #0b74e5;
      margin-right: 5px;
    }
  }

  .delivery-fee {
    margin-bottom: 8px;
    
    span {
      font-weight: 500;
      color: #666;
      margin-right: 5px;
    }
  }

  .payment-info {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .status-payment {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    display: inline-block;
    background-color: ${props => props.isPaid ? '#e6f7ed' : '#feeaeb'};
    color: ${props => props.isPaid ? '#0a8043' : '#e53e3e'};
  }
`;

export const WrapperStyleContent = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
`;

export const ProductHeader = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
  
  .product-column {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    flex: 2;
    padding-left: 10px;
  }
`;

export const WrapperItemLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  text-align: center;
  flex: 1;
`;

export const WrapperProduct = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: 1px solid #eaeaea;
  }
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

export const WrapperNameProduct = styled.div`
  display: flex;
  align-items: center;
  flex: 2;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 4px;
    margin-right: 15px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  div {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    
    .product-variant {
      margin-top: 6px;
      font-size: 13px;
      color: #666;
      font-weight: normal;
      
      .separator {
        margin: 0 6px;
        color: #ddd;
      }
    }
  }
`;

export const WrapperItem = styled.div`
  font-size: 15px;
  color: #333;
  text-align: center;
  flex: 1;
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: ${props => props.total ? '16px 0 0 0' : '12px 0'};
  margin-top: ${props => props.total ? '8px' : '0'};
  border-top: ${props => props.total ? '1px solid #eaeaea' : 'none'};
`;

export const PriceLabel = styled.div`
  font-size: 15px;
  font-weight: ${props => props.total ? '700' : '500'};
  color: #333;
  margin-right: 40px;
  width: 120px;
  text-align: right;
`;

export const PriceValue = styled.div`
  font-size: ${props => props.total ? '18px' : '15px'};
  font-weight: ${props => props.total ? '700' : '500'};
  color: ${props => {
    if (props.total) return '#fe3834';
    if (props.discount) return '#0a8043';
    return '#333';
  }};
  width: 150px;
  text-align: right;
`;

export const WrapperAllPrice = styled.div`
  margin-top: 20px;
  margin-left: auto;
  width: 400px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const WrapperFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  .order-date {
    font-size: 14px;
    color: #666;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    
    .order-date {
      text-align: center;
    }
  }
`;

export const WrapperActions = styled.div`
  display: flex;
  gap: 12px;

  button {
    padding: 10px 20px;
    border: 1px solid #0b74e5;
    border-radius: 6px;
    background: transparent;
    color: #0b74e5;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #0b74e5;
      color: #fff;
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    
    button {
      flex: 1;
      text-align: center;
    }
  }
`;

export const WrapperReviewSection = styled.div`
  margin-top: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }
`;

export const WrapperReviewProduct = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  .product-info {
    display: flex;
    align-items: center;
    flex: 2;
    
    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      margin-right: 15px;
    }
    
    .product-name {
      font-size: 15px;
      font-weight: 500;
      color: #333;
    }
    
    .product-variant {
      font-size: 13px;
      color: #666;
      
      .separator {
        margin: 0 6px;
        color: #ddd;
      }
    }
  }
  
  .review-form {
    flex: 1;
    
    input[type="number"] {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-size: 14px;
      
      &:focus {
        border-color: #0b74e5;
        outline: none;
      }
    }
    
    button {
      margin-top: 10px;
      padding: 8px 16px;
      border-radius: 4px;
      background-color: #0b74e5;
      color: #fff;
      border: none;
`