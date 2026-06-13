import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Chart({ 
  type = 'line', 
  data = [], 
  dataKeys = [], 
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], 
  height = 300, 
  xAxisKey = 'name' 
}) {
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: '#14141f', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 8, 
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <p style={{ fontSize: 11, color: '#7c7c98', marginBottom: 4 }}>{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ fontSize: 13, fontWeight: 600, color: pld.color || colors[index % colors.length] }}>
              {pld.name}: {typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={xAxisKey} stroke="#4a4a64" fontSize={11} />
            <YAxis stroke="#4a4a64" fontSize={11} />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={xAxisKey} stroke="#4a4a64" fontSize={11} />
            <YAxis stroke="#4a4a64" fontSize={11} />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            {dataKeys.map((key, i) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[i % colors.length]} 
                fillOpacity={1} 
                fill={`url(#grad-${key})`} 
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKeys[0] || 'value'}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey={xAxisKey} stroke="#4a4a64" fontSize={11} />
            <YAxis stroke="#4a4a64" fontSize={11} />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            {dataKeys.map((key, i) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[i % colors.length]} 
                strokeWidth={2} 
                dot={{ r: 3, strokeWidth: 1 }} 
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
