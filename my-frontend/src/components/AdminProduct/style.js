import { Upload, Button } from "antd";
import styled from "styled-components";

export const WrapperHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const WrapperHeader = styled.h1`
  color: #000;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

export const WrapperButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;


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


export const WrapperActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  gap: 12px;
`;

export const SearchInput = styled.input`
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  width: 260px;

  &:focus {
    border-color: #1890ff;
  }
`;

export const SearchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    height: 40px;
    border-radius: 8px;
  }

  button {
    height: 40px;
  }
`;


export const AddButton = styled(Button)`
  background-color: #e74c3c;
  color: white;
  font-weight: 500;
  border-radius: 8px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: #c0392b;
    color: white;
  }
`;

export const PlusIcon = styled.span`
  display: flex;
  align-items: center;
`;


export const WrapperTableContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;