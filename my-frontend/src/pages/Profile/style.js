import styled from "styled-components";
import { Upload } from 'antd';


export const WrapperHeader = styled.h1`
    color: #030;
    font-size: 18;
    margin: 4px 0;
`

export const WrapperContentProfile = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    width: 600px;
    margin: 0 auto;
    padding: 30px;
    border-radius: 10px;
    gap: 30px;
`

export const WrapperLabel = styled.label`
    color: #000;
    font-size: 12px;
    line-height: 30px;
    font-weight: 600px;
    width: 60px;
    text-align: left;
`

export const WrapperInput = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`

export const WrapperUploadFile = styled(Upload)`
    & .ant-upload.ant-upload-select.ant-upload-select-picture-card {
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }
     & .ant-upload-list-item-error {
        display: none;
    }
    & .ant-upload-list-item-info {
        display: none
    }
   & .ant-upload-list-item {
        display: none
    }
    & .ant-upload-list {
        display: none;
    }
`









// import styled from "styled-components";

// export const WrapperContainer = styled.div`
//   width: 1270px;
//   margin: 20px auto;
//   display: flex;
//   gap: 20px;
// `;

// export const WrapperSidebar = styled.div`
//   width: 250px;
//   padding: 20px;
//   background: #f8f8f8;
//   border-radius: 8px;

//   h3 {
//     margin-bottom: 10px;
//   }

//   ul {
//     list-style: none;
//     padding: 0;

//     li {
//       padding: 10px 0;
//       cursor: pointer;
//       border-bottom: 1px solid #ddd;
//     }

//     li:hover {
//       color: #1890ff;
//     }
//   }
// `;

// export const WrapperContent = styled.div`
//   flex: 1;
//   background: white;
//   padding: 20px;
//   border-radius: 8px;
//   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
// `;

// export const WrapperHeader = styled.h1`
//   font-size: 20px;
//   font-weight: bold;
//   color: #333;
// `;

// export const WrapperUserInfo = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 20px;

//   h3 {
//     margin: 0;
//   }

//   p {
//     color: #666;
//   }

//   button {
//     margin-top: 10px;
//   }
// `;
