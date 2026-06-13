import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import KPICard from '../components/ui/KPICard';
import Chart from '../components/ui/Chart';
import { TrendingUp, UserPlus, FileText, CheckCircle, Handshake } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { calculatePipelineValue, calculateConversionRate } from '../utils/kpi';

export default function SalesDashboard() {
  const leads = useLiveQuery(() => db.leads.toArray()) || [];

  // Compute conversion rate
  const conversionRate = useMemo(() => calculateConversionRate(leads), [leads]);
  
  // Weighted active pipeline
  const pipelineValue = useMemo(() => calculatePipelineValue(leads), [leads]);

  // Total Converted Revenue
  const totalRevenue = useMemo(() => {
    return leads
      .filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT')
      .reduce((sum, l) => sum + (Number(l.opportunityValue) || 0), 0);
  }, [leads]);

  // Funnel data counts for stages
  const funnelData = useMemo(() => {
    const counts = {
      'NEW': 0, 'CONTACTED': 0, 'QUALIFIED': 0, 'SAMPLE_SENT': 0,
      'TRIAL': 0, 'PROPOSAL': 0, 'CUSTOMER': 0, 'REPEAT': 0
    };
    leads.forEach(l => { if (counts[l.stage] !== undefined) counts[l.stage]++; });
    
    return [
      { name: 'New Lead', value: counts['NEW'] },
      { name: 'Contacted', value: counts['CONTACTED'] },
      { name: 'Qualified', value: counts['QUALIFIED'] },
      { name: 'Sample Sent', value: counts['SAMPLE_SENT'] },
      { name: 'Trial Stage', value: counts['TRIAL'] },
      { name: 'Proposal', value: counts['PROPOSAL'] },
      { name: 'Customer', value: counts['CUSTOMER'] + counts['REPEAT'] }
    ];
  }, [leads]);

  // Lead values by industry segment
  const industryData = useMemo(() => {
    const industries = {};
    leads.forEach(l => {
      if (!industries[l.industry]) industries[l.industry] = 0;
      industries[l.industry] += Number(l.opportunityValue) || 0;
    });
    return Object.keys(industries).map(key => ({
      name: key,
      value: industries[key]
    }));
  }, [leads]);

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          Sales Performance Dashboard
        </h1>
        <p className="text-sm text-secondary">Analyze food processor deal conversions, B2B pipeline values, and segment indicators.</p>
      </div>

      {/* KPI stats */}
      <div className="kpi-grid">
        <KPICard label="Total Sales Value" value={formatCurrency(totalRevenue)} icon={Handshake} color="#10b981" colorDim="rgba(16, 185, 129, 0.15)" />
        <KPICard label="Weighted Pipe" value={formatCurrency(pipelineValue)} icon={TrendingUp} color="#f59e0b" colorDim="rgba(245, 158, 11, 0.15)" />
        <KPICard label="Outreach Conversion" value={`${conversionRate}%`} icon={CheckCircle} color="#3b82f6" colorDim="rgba(59, 130, 246, 0.15)" />
        <KPICard label="Total Deals logged" value={leads.length} icon={UserPlus} color="#8b5cf6" colorDim="rgba(139, 92, 246, 0.15)" />
      </div>

      {/* Charts Funnel & Segments */}
      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        <Card header={<span className="card-title">Deal Pipeline Stage Counts</span>}>
          <Chart type="bar" data={funnelData} dataKeys={['value']} xAxisKey="name" colors={['#3b82f6']} />
        </Card>
        
        <Card header={<span className="card-title">Market Value segment (INR)</span>}>
          <Chart type="pie" data={industryData} dataKeys={['value']} xAxisKey="name" />
        </Card>
      </div>
    </div>
  );
}
