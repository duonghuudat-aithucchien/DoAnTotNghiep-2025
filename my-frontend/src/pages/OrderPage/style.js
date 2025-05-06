// ĐÃ CẬP NHẬT styled-components của bạn (bản đẹp và cân đối hơn)

import styled from "styled-components";
import { InputNumber } from "antd";

// WrapperStyleHeader không thay đổi
export const WrapperStyleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0;
    justify-content: space-between;
    width: 380px; // cố định độ rộng để giữ thẳng hàng
  }

  .column {
    display: inline-block;
    text-align: center;
  }

  .quantity {
    width: 100px;
  }

  .discount {
    width: 80px;
  }

  .total {
    width: 100px;
  }

  .delete-icon {
    width: 24px;
    text-align: center;
    cursor: pointer;
  }
`;


export const WrapperStyleHeaderDelivery = styled.div`
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  span {
    color: #1a1a1a;
    font-weight: 500;
    font-size: 15px;
  }

  @media (max-width: 768px) {
    span {
      font-size: 14px;
    }
  }
`;

export const WrapperLeft = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: #f5f5fa;

  & > * {
    border-radius: 20px;
    background-color: #ffffff;
    padding: 20px 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    padding: 16px;

    & > * {
      padding: 16px;
    }
  }
`;


export const WrapperListOrder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const WrapperItemOrder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-radius: 16px;
  padding: 16px 20px;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #f1f1f1;

  .left {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 420px;
    flex: 1;

    img {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      object-fit: cover;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .product-name {
        font-weight: 600;
        font-size: 15px;
        color: #1a1a1a;
        max-width: 280px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .product-sub {
        font-size: 13px;
        color: #888;
      }
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 32px;

    .price {
      font-weight: 600;
      font-size: 14px;
      color: rgb(255, 66, 78);
      white-space: nowrap;
    }

    .delete {
      cursor: pointer;
      color: #999;
      font-size: 16px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;

    .left,
    .right {
      width: 100%;
      justify-content: space-between;
    }

    .right {
      gap: 24px;
    }
  }
`;


export const WrapperPriceDiscount = styled.span`
  color: #9ca3af;
  font-size: 13px;
  text-decoration: line-through;
  margin-left: 6px;
  font-weight: 400;
`;

export const WrapperCountOrder = styled.div`
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-radius: 999px;
  overflow: hidden;
  height: 36px;

  button {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: #e5e5e5;
    }

    svg {
      font-size: 12px;
      color: #1a1a1a;
    }
  }
`;



export const WrapperRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  min-width: 320px;

  .subtotal-info {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #000;
    font-weight: bold;
  }

  .total {
    font-size: 24px;
    font-weight: bold;
    color: rgb(254, 56, 52);
  }

  .discount {
    color: #f43f5e;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 20px;
  }
`;

export const WrapperInfo = styled.div`
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  width: 100%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;

  input {
    padding: 10px 16px;
    border-radius: 999px;
    border: none;
    background: #f3f4f6;
    font-size: 14px;
    flex: 1;
  }

  button {
    padding: 10px 24px;
    border-radius: 999px;
    border: none;
    background: #000;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

export const WrapperTotal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  border-radius: 16px;
  width: 100%;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07);

  span {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
  }

  .total-price {
    color: rgb(254, 56, 52);
    font-size: 24px;
    font-weight: bold;
  }

  .vat-info {
    font-size: 11px;
    color: #000;
    text-align: right;
  }

  @media (max-width: 768px) {
    padding: 20px;

    .total-price {
      font-size: 22px;
    }
  }
`;

export const WrapperInputNumber = styled(InputNumber)`
  width: 40px;
  height: 36px;
  border: none !important;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background-color: transparent;
  border-radius: 0;

  .ant-input-number-input {
    padding: 0;
    text-align: center;
    background: transparent;
  }

  .ant-input-number-handler-wrap {
    display: none;
  }

  &:hover,
  &:focus-within {
    border-color: transparent;
    box-shadow: none;
  }
`;
