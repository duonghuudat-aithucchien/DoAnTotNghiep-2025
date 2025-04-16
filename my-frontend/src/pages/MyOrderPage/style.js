import styled from "styled-components";

export const WrapperStyleHeader = styled.div`
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  span {
    color: rgb(36,36,36);
    font-weight: 400;
    font-sizeL 13px;
  }

`;

export const WrapperStyleHeaderDelivery = styled.div`
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  span {
    color: rgb(36,36,36);
    font-weight: 400;
    font-sizeL 13px;
  };
  margin-bottom: 4px;

`

export const WrapperLeft = styled.div`
  width: 65%;
  padding-right: 20px;
  overflow-y: auto;
`;

export const WrapperContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: #f5f5fa;
  padding: 20px;
`;

export const WrapperListOrder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
`;

export const WrapperStatus = styled.div`
  margin-bottom: 16px;
  font-size: 14px;

  span {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }

  .status {
    color: rgb(255, 66, 78);
    font-weight: 600;
  }
`;

export const WrapperHeaderItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export const WrapperFooterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;

  .total-price {
    font-size: 18px;
    font-weight: 700;
    color: rgb(254, 56, 52);
  }

  .actions {
    display: flex;
    gap: 10px;

    button {
      padding: 8px 16px;
      border: 1px solid rgb(11, 116, 229);
      border-radius: 4px;
      background: transparent;
      color: rgb(11, 116, 229);
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: rgb(11, 116, 229);
        color: #fff;
      }
    }
  }
`;

export const WrapperItemOrder = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;

  &:hover {
    background-color: #f9f9f9;
  }

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 15px;
  }

  .product-info {
    flex: 2;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-price {
    flex: 1;
    text-align: right;
    font-size: 16px;
    font-weight: 700;
    color: rgb(254, 56, 52);
  }
`;

export const WrapperPriceDiscount = styled.span`
  color: #999;
  font-size: 13px;
  text-decoration: line-through;
  margin-left: 6px;
  font-weight: 400;
`;

export const WrapperCountOrder = styled.div`
  display: flex;
  align-items: center;
  width: 110px;
  border-radius: 4px;
  margin-top: 10px;
  gap: 5px;
  padding: 5px 10px;
  background: #f5f5f5;

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;

export const WrapperRight = styled.div`
  width: 35%;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  .subtotal-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #333;
    font-weight: 600;
  }

  .total {
    font-size: 24px;
    font-weight: 700;
    color: rgb(254, 56, 52);
  }
`;

export const WrapperInfo = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  display: flex;
  flex-direction: column;
  gap: 10px;

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #555;

    .label {
      font-weight: bold;
      color: #333;
    }

    .value {
      text-align: right;
    }
  }
`;

export const WrapperTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  span {
    font-size: 18px;
    font-weight: 700;
  }

  .total-price {
    color: rgb(254, 56, 52);
    font-size: 26px;
    font-weight: 700;
  }

  .vat-info {
    font-size: 12px;
    color: #888;
  }
`;

