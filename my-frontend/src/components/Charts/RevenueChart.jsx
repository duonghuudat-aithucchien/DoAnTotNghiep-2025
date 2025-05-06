import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Tabs, Card } from 'antd';

const { TabPane } = Tabs;

const RevenueChart = ({ weeklyData = [], monthlyData = [], yearlyData = [] }) => {
  const [activeTab, setActiveTab] = useState('week');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (activeTab === 'week') setChartData(weeklyData);
    if (activeTab === 'month') setChartData(monthlyData);
    if (activeTab === 'year') setChartData(yearlyData);
  }, [activeTab, weeklyData, monthlyData, yearlyData]);

  return (
    <Card style={{ borderRadius: 12 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
        <TabPane tab="Tuần" key="week" />
        <TabPane tab="Tháng" key="month" />
        <TabPane tab="Năm" key="year" />
      </Tabs>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              style={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) =>
                value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1890ff"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;
