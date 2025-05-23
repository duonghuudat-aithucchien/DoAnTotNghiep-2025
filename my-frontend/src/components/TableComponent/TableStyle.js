// src/components/TableStyles.js
import styled from 'styled-components';

export const StyledTableWrapper = styled.div`
  .ant-table {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .ant-table-thead > tr > th {
    background-color: #fafafa;
    font-weight: 600;
    text-align: center;
    color: #444;
    padding: 12px;
  }

  .ant-table-tbody > tr > td {
    text-align: center;
    padding: 12px 8px;
    vertical-align: middle;
  }

  .ant-table-tbody > tr:hover {
    background-color: #f0f5ff;
    transition: background-color 0.2s ease;
  }

  .ant-btn {
    border-radius: 6px;
  }

  .ant-btn-primary {
    background-color: #1677ff;
    border-color: #1677ff;
  }

  .ant-btn-primary:hover {
    background-color: #4096ff;
    border-color: #4096ff;
  }
`;
