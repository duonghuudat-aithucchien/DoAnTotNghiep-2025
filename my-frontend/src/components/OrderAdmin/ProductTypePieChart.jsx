import React, { useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { convertDataChartFullByProductType } from '../../utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c', '#f28e8e'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ProductTypePieChart = ({ data }) => {
  const [mode, setMode] = useState('quantity'); // 'quantity' hoặc 'revenue'
  const fullData = convertDataChartFullByProductType(data);

  const chartData = fullData.map((item) => ({
    name: item.name,
    value: mode === 'quantity' ? item.quantity : item.revenue,
  }));

  return (
    <div style={{ width: '100%', height: 450 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 10 }}>
        Biểu đồ {mode === 'quantity' ? 'số lượng' : 'doanh thu'} theo loại sản phẩm
      </h3>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <label style={{ marginRight: 20 }}>
          <input
            type="radio"
            value="quantity"
            checked={mode === 'quantity'}
            onChange={() => setMode('quantity')}
          />{' '}
          Số lượng
        </label>
        <label>
          <input
            type="radio"
            value="revenue"
            checked={mode === 'revenue'}
            onChange={() => setMode('revenue')}
          />{' '}
          Doanh thu
        </label>
      </div>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              mode === 'revenue'
                ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                : `${value} sản phẩm`
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTypePieChart;
