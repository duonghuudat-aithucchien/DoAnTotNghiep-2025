import styled from "styled-components";

// Color constants
const textPrimary = '#333';
const textSecondary = '#777';
const textMuted = '#aaa';
const primaryBlue = '#1890ff';
const dangerRed = '#ff424e';

const statusStyles = {
  paid: ['#389e0d', '#f6ffed'],
  unpaid: ['#d48806', '#fffbe6'],
  delivered: ['#08979c', '#e6fffb'],
  undelivered: ['#cf1322', '#fff1f0'],
};

export const WrapperContainer = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20px 0;
`;

export const WrapperListOrder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const WrapperStatus = styled.div`
  display: flex;
  gap: 8px;

  .tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .delivered {
    color: ${statusStyles.delivered[0]};
    background-color: ${statusStyles.delivered[1]};
  }
  
  .undelivered {
    color: ${statusStyles.undelivered[0]};
    background-color: ${statusStyles.undelivered[1]};
  }
  
  .paid {
    color: ${statusStyles.paid[0]};
    background-color: ${statusStyles.paid[1]};
  }
  
  .unpaid {
    color: ${statusStyles.unpaid[0]};
    background-color: ${statusStyles.unpaid[1]};
  }
`;

export const WrapperHeaderItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  
  img {
    width: 70px;
    height: 70px;
    object-fit: cover;
    border: 1px solid #eee;
    border-radius: 10px;
    margin-right: 16px;
  }

  .product-info {
    flex: 1;
    font-weight: 500;
    margin-bottom: 6px;
    font-size: 15px;
    color: ${textPrimary};
  }

  .product-meta {
    color: ${textSecondary};
    font-size: 13px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .product-price {
    font-weight: 600;
    color: ${dangerRed};
    text-align: right;
    min-width: 120px;
  }
`;

export const WrapperFooterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;

  .total-label {
    font-weight: 500;
    margin-right: 8px;
  }

  .total-price {
    color: ${dangerRed};
    font-size: 18px;
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 12px;
  }
`;

export const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebedf0;

  .order-id {
    display: flex;
    gap: 12px;
    align-items: center;
    
    .id-label {
      font-weight: 500;
      font-size: 14px;
    }
    
    .id-value {
      font-weight: 600;
      color: ${primaryBlue};
    }
  }
`;

export const EmptyOrders = styled.div`
  text-align: center;
  padding: 60px;
  background-color: #fff;
  border-radius: 12px;
  color: ${textSecondary};
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;

  h2 {
    font-weight: 600;
    font-size: 22px;
    margin: 0;
  }
`;

// Optional: Styled button components if needed
export const CancelButton = styled.button`
  background-color: #fff;
  border: 1px solid ${dangerRed};
  border-radius: 6px;
  height: 36px;
  padding: 0 16px;
  color: ${dangerRed};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #fff1f0;
  }
`;

export const DetailsButton = styled.button`
  background-color: ${primaryBlue};
  border: none;
  border-radius: 6px;
  height: 36px;
  padding: 0 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #096dd9;
  }
`;

export const OrderContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

export const OrderCard = styled.div`
  margin-bottom: ${({ isLast }) => isLast ? 0 : '16px'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background-color: #fff;
`;

export const ProductsList = styled.div`
  padding: 0 16px;
`;