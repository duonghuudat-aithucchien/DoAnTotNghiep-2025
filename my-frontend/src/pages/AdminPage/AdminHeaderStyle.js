import styled from 'styled-components';

export const WrapperHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
`;


export const WrapperLogo = styled.div`
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
`;

export const WrapperSearch = styled.div`
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
`;

export const WrapperRightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const WrapperLanguage = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
`;

export const WrapperUserInfo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;


export const WrapperHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
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