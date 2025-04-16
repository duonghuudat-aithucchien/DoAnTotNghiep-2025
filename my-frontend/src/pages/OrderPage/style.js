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


export const WrapperListOrder = styled.div``;

export const WrapperItemOrder = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 18px;
  background: #fff;
  margin-top: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #f9f9f9;
  }

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
  }

  .product-info {
    width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 500;
    color: #333;
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

