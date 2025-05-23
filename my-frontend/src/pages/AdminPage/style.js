import styled from 'styled-components'
import { Card, Tabs } from 'antd'

// Card chung
const commonCardStyle = `
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
`

export const WrapperContainer = styled.div`
  background: #f5f6fa;
  padding: 24px;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

export const StatCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const GradientText = styled.span`
  background: linear-gradient(90deg, #34d399, #8c88f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 14px;
  font-weight: 600;
`;





export const IconWrapper = styled.div`
  background-color: ${({ color }) => color}20;
  color: ${({ color }) => color};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

export const GrowthText = styled.div`
  font-size: 12px;
  color: ${({ positive }) => (positive ? '#52c41a' : '#ff4d4f')};
  display: flex;
  align-items: center;
  gap: 4px;
`;


export const RevenueChartCard = styled(Card)`
  ${commonCardStyle}
  height: 100%;
`

export const ChartTabs = styled(Tabs)`
  margin-bottom: 20px;

  .ant-tabs-nav {
    margin: 0 auto;
  }

  .ant-tabs-tab {
    padding: 4px 16px;
    font-weight: 500;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #1890ff;
  }

  .ant-tabs-ink-bar {
    background: #1890ff;
  }
`

export const ListCard = styled(Card)`
  ${commonCardStyle}
  height: 100%;
`

export const ListItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 0;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
    background: #f0f0f0;
    transition: all 0.3s;
  }

  .info {
    display: flex;
    flex-direction: column;

    strong {
      font-size: 14px;
      margin-bottom: 4px;
    }

    div {
      font-size: 13px;
      color: #777;
    }
  }
`

export const SidebarMenu = styled.div`
  width: 256px;
  background-color: #fff;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.1);

  .ant-menu {
    border-right: none;
    height: 100vh;
  }

  .ant-menu-item-selected {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
    font-weight: 600;
  }
`

export const ContentWrapper = styled.div`
  flex: 1;
  padding: 15px;
`

export const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
`

export const CardValue = styled.p`
  font-size: 22px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
`

export const TableWrapper = styled.div`
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;

    th,
    td {
      padding: 10px 12px;
      text-align: left;
      font-size: 14px;
    }

    thead {
      background: #f0f2f5;
      font-weight: 600;
    }

    tbody tr {
      border-bottom: 1px solid #eee;
    }

    tbody tr:last-child {
      border-bottom: none;
    }

    span {
      font-weight: 500;
    }
  }
`
