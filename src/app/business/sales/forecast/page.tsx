'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { DollarSign, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function SalesForecast() {
  const leads = useLiveQuery(() => db.leads.toArray()) || [];
  
  // Basic calculations
  const activeLeads = leads.filter(l => !['Customer', 'Lost'].includes(l.status));
  const totalPipeline = activeLeads.reduce((acc, l) => acc + (l.opportunityValue || 0), 0);
  
  // Weighted pipeline (mock win rates: Trial=80%, Proposal=50%, Qualified=20%, Lead=5%)
  const getWeightedValue = (lead: any) => {
    const val = lead.opportunityValue || 0;
    switch(lead.status) {
      case 'Trial': return val * 0.8;
      case 'Proposal': return val * 0.5;
      case 'Sample Sent': return val * 0.3;
      case 'Qualified': return val * 0.2;
      case 'Contacted': return val * 0.1;
      case 'Lead': return val * 0.05;
      default: return 0;
    }
  };
  
  const weightedPipeline = activeLeads.reduce((acc, l) => acc + getWeightedValue(l), 0);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-[#16A34A]" />
            <span className="font-mono text-sm text-[#16A34A] tracking-widest uppercase">Revenue Engine</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Sales Forecast
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-elevated border-l-4 border-l-[#00B4D8] flex flex-col justify-center items-center py-10">
          <div className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-2">Total Pipeline Value</div>
          <div className="text-5xl font-bold text-white mb-2">{formatCurrency(totalPipeline)}</div>
          <div className="text-sm text-zinc-500">Unweighted raw opportunity value</div>
        </div>
        
        <div className="card-elevated border-l-4 border-l-[#16A34A] flex flex-col justify-center items-center py-10">
          <div className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            Weighted Forecast <span title="Based on historical win rates per stage"><AlertCircle className="w-4 h-4 text-zinc-500" /></span>
          </div>
          <div className="text-5xl font-bold text-[#16A34A] mb-2">{formatCurrency(weightedPipeline)}</div>
          <div className="text-sm text-[#4ADE80]">Expected revenue based on current stages</div>
        </div>
      </div>

      <div className="card-elevated mt-4 h-80 flex items-center justify-center border-dashed border-2 border-zinc-800 bg-transparent">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-zinc-400">Recharts Projection Pending</h3>
          <p className="text-zinc-500">Monthly forecast chart will render here when enough data is collected.</p>
        </div>
      </div>
    </div>
  );
}
