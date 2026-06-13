import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: 'positive' | 'negative' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  color?: string;
  colorDim?: string;
  onClick?: () => void;
}

export default function KPICard({ 
  label, 
  value, 
  trend, 
  trendValue, 
  icon: Icon, 
  color = '#3b82f6', 
  colorDim = 'rgba(59, 130, 246, 0.15)', 
  onClick 
}: KPICardProps) {
  const cardStyle = {
    '--kpi-color': color,
    '--kpi-color-dim': colorDim,
    cursor: onClick ? 'pointer' : 'default'
  } as React.CSSProperties;

  return (
    <div className="kpi-card" style={cardStyle} onClick={onClick}>
      <div className="kpi-header flex items-center justify-between">
        <span className="kpi-label text-xs font-semibold text-zinc-400">{label}</span>
        {Icon && (
          <div className="kpi-icon p-2 rounded-lg bg-[var(--kpi-color-dim)] text-[var(--kpi-color)]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="kpi-value text-2xl font-bold mt-2 text-zinc-100">{value}</div>
      {trend && (
        <div className={`kpi-trend ${trend} flex items-center gap-1 text-xs mt-2 font-medium`}>
          {trend === 'positive' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
          {trend === 'negative' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-zinc-500" />}
          <span className={
            trend === 'positive' ? 'text-emerald-500' :
            trend === 'negative' ? 'text-rose-500' : 'text-zinc-500'
          }>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
