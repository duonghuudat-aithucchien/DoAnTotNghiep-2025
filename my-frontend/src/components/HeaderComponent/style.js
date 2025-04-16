// import { Row } from "antd";
// import styled from "styled-components";

// export const WrapperHeader = styled(Row)`
//     background-color: rgb(26,148,255);
//     align-items: center;
//     gap: 16px;
//     flex-wrap: nowrap;
//     width: 1270px;
//     padding: 10px 0;
    
// `;

// export const WrapperTextHeader = styled.span`
//     font-size: 18px;
//     color: #fff;
//     font-weight: bold;
//     text-align: left;
//     cursor: pointer;

// `;

// export const WrapperHeaderAccount = styled.div`
//     display: flex;
//     align-items: center;
//     color: #fff;
//     gap: 10px;
// `

// export const WrapperTextHeaderSmall = styled.span`
//     color: #fff;
//     font-size: 12px;
//     white-space: nowrap;
// `

// export const WrapperContentPopup = styled.p`
//     cursor: pointer;
//     &:hover {
//         color: rgb(26,148,255);
//     }
// `

import styled from 'styled-components';

export const WrapperHeader = styled.div`
  width: 100%;
  padding: 16px 40px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const WrapperHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

export const WrapperLogo = styled.h1`
  font-size: 26px;
  font-weight: bold;
  cursor: pointer;
`;

export const WrapperNav = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const WrapperNavItem = styled.div`
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    color: #1890ff;
  }
`;

export const WrapperSearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: #f1f1f1;
  border-radius: 999px;
  padding: 4px 12px;

  input {
    width: 100%;
    border: none;
    background: transparent;
    padding: 8px;
    outline: none;
    font-size: 15px;
  }
`;

export const WrapperIcons = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  .avatar {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

export const WrapperHeaderAccount = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const WrapperTextHeaderSmall = styled.span`
  font-size: 12px;
  white-space: nowrap;
`;

export const WrapperContentPopup = styled.p`
  cursor: pointer;
  &:hover {
    color: #1890ff;
  }
`;

export const TopBanner = styled.div`
  width: 100%;
  background-color: #000;
  color: #fff;
  text-align: center;
  padding: 8px 16px;
  font-size: 14px;
  position: relative;
`;

export const CloseIcon = styled.span`
  position: absolute;
  right: 16px;
  top: 8px;
  cursor: pointer;
  font-size: 18px;
`;