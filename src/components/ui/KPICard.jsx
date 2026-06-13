import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KPICard({ 
  label, 
  value, 
  trend, 
  trendValue, 
  icon: Icon, 
  color = '#3b82f6', 
  colorDim = 'rgba(59, 130, 246, 0.15)', 
  onClick 
}) {
  const cardStyle = {
    '--kpi-color': color,
    '--kpi-color-dim': colorDim,
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <div className="kpi-card" style={cardStyle} onClick={onClick}>
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <div className="kpi-icon">
            <Icon />
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div className={`kpi-trend ${trend}`}>
          {trend === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
          {trend === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
