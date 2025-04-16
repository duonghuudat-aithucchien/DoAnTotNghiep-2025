import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, Cell
} from 'recharts';
import { convertDataChartByProduct } from '../../utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c', '#f28e8e'];

const BarChartComponent = ({ data }) => {
  const chartData = convertDataChartByProduct(data);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20, right: 30, left: 20, bottom: 50,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} />
          <YAxis tickFormatter={(value) => `${(value / 1e6).toFixed(1)}M`} />
          <Tooltip formatter={(value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} />
          <Legend />
          <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(value) => `${(value / 1e6).toFixed(1)}M`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
