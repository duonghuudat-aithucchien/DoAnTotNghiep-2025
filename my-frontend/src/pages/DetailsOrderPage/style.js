import styled from 'styled-components';

export const WrapperHeaderUser = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  align-items: center;
`;

export const WrapperInfoUser = styled.div`
  flex: 1;
  margin-right: 20px;

  &:last-child {
    margin-right: 0;
  }

  .info-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .info-content {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
  }
`;

export const WrapperLabel = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

export const WrapperContentInfo = styled.div`
  font-size: 14px;
  color: #555;

  .name-info {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .address-info,
  .phone-info,
  .delivery-info,
  .delivery-fee,
  .payment-info,
  .status-payment {
    margin-bottom: 5px;
  }

  .name-delivery {
    font-weight: bold;
    color: rgb(11, 116, 229);
  }
`;

export const WrapperStyleContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const WrapperItemLabel = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #333;
  text-align: center;
  flex: 1;
`;

export const WrapperProduct = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
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
    border: 1px solid rgb(238, 238, 238);
    border-radius: 4px;
    margin-right: 15px;
  }

  div {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
`;

export const WrapperItem = styled.div`
  font-size: 14px;
  color: #555;
  text-align: center;
  flex: 1;

  .item-label {
    font-weight: bold;
    color: #333;
  }

  .item-value {
    margin-top: 5px;
    font-size: 14px;
    color: #555;
  }
`;

export const WrapperFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  .total-label {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }

  .total-value {
    font-size: 20px;
    font-weight: bold;
    color: rgb(254, 56, 52);
  }
`;

export const WrapperActions = styled.div`
  display: flex;
  gap: 10px;

  button {
    padding: 10px 20px;
    border: 1px solid rgb(11, 116, 229);
    border-radius: 4px;
    background: transparent;
    color: rgb(11, 116, 229);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;

    &:hover {
      background: rgb(11, 116, 229);
      color: #fff;
    }
  }
`;

export const WrapperAllPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`