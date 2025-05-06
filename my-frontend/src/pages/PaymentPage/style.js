import styled from "styled-components";
import { Radio } from "antd";

export const WrapperStyleHeader = styled.div`
  background: #fff;
  padding: 12px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;

  span {
    color: #242424;
    font-weight: 400;
    font-size: 13px;
  }
`;

export const WrapperLeft = styled.div`
  width: 910px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const WrapperListOrder = styled.div``;

export const WrapperItemOrder = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 0 1px #eee;
`;

export const WrapperPriceDiscount = styled.span`
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 4px;
`;

export const WrapperCountOrder = styled.div`
  display: flex;
  align-items: center;
  width: 84px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

export const WrapperRight = styled.div`
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
`;

export const WrapperInfo = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 0 1px #eee;
  display: flex;
  flex-direction: column;
  gap: 10px;

  span {
    font-size: 14px;
  }

  .address {
    color: #0056ff;
    font-weight: bold;
  }

  .change-address {
    color: #0056ff;
    cursor: pointer;
    margin-left: 8px;
    font-weight: 500;
  }
`;

export const WrapperTotal = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 0 1px #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  span:first-child {
    font-weight: 600;
    font-size: 14px;
  }

  span:last-child {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    span:first-child {
      font-size: 22px;
      color: #fe3834;
      font-weight: 700;
    }

    span:last-child {
      font-size: 11px;
      color: #000;
    }
  }
`;

export const Label = styled.span`
  font-size: 14px;
  color: #000;
  font-weight: 600;
`;

export const WrapperRadio = styled(Radio.Group)`
  margin-top: 8px;
  background: #f5f7ff;
  border: 1px solid #c2e1ff;
  width: 100%;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
