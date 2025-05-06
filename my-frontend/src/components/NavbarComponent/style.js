// import styled from "styled-components";

// export const WrapperLableText = styled.h4`
//     color: rgb(56,56,61);
//     font-size: 14px;
//     font-weight 500;
// `

// export const WrapperTextValue = styled.span`
//     color: rgb(56,56,61);
//     font-size: 12px;
//     font-weight: 400;
// `

// export const WrapperContent= styled.div`
//     display: flex;
//     //align-items: center;
//     flex-direction: column;
//     gap: 12px;
// `

// export const WrapperTextPrice = styled.div`
//     padding: '4px';
//     color: 'rgb(56,56,61)';
//     borderRadius: '10px';
//     backgroundColor: '#ccc';
//     width: 'fit-content';
// `
import styled from 'styled-components'

export const WrapperContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`

export const WrapperFilterTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`

export const WrapperSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const WrapperLableText = styled.h4`
  color: rgb(56,56,61);
  font-size: 14px;
  font-weight: 600;
`

export const WrapperTextValue = styled.span`
  color: rgb(56,56,61);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  &:hover {
    color: #1677ff;
  }
`

export const WrapperContent= styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const WrapperTextPrice = styled.div`
  padding: 6px 12px;
  color: rgb(56,56,61);
  border-radius: 10px;
  background-color: #f2f2f2;
  width: fit-content;
  font-size: 13px;
  font-weight: 500;
`

export const ColorCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) => props.color || '#ccc'};
  border: 1.5px solid #e2e2e2;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #1677ff;
    transform: scale(1.1);
  }
`

export const ApplyButton = styled.button`
  margin-top: 8px;
  padding: 10px;
  background-color: #000;
  color: #fff;
  font-size: 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    opacity: 0.9;
  }
`
