import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import KPICard from '../components/ui/KPICard';
import { Building2, UserPlus, Package, Truck, TrendingUp, Handshake } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { calculatePipelineValue } from '../utils/kpi';

export default function BusinessERP() {
  const leads = useLiveQuery(() => db.leads.toArray()) || [];
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];

  // Computed Business KPIs
  const pipelineValue = useMemo(() => calculatePipelineValue(leads), [leads]);
  const activeLeadsCount = useMemo(() => leads.filter(l => l.stage !== 'CUSTOMER' && l.stage !== 'REPEAT').length, [leads]);
  const activeCustomersCount = useMemo(() => leads.filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT').length, [leads]);

  const totalRevenue = useMemo(() => {
    return leads
      .filter(l => l.stage === 'CUSTOMER' || l.stage === 'REPEAT')
      .reduce((sum, l) => sum + (Number(l.opportunityValue) || 0), 0);
  }, [leads]);

  const moduleLinks = [
    { label: 'Sales CRM', desc: 'B2B Sales lead pipelines & opportunities mapping', icon: UserPlus, path: '/business/crm', color: '#3b82f6', colorDim: 'rgba(59, 130, 246, 0.15)', metric: `${activeLeadsCount} active leads` },
    { label: 'KAFS Products', desc: 'Manage hydrocolloid, carrageenan, and agricultural products catalogues', icon: Package, path: '/business/products', color: '#10b981', colorDim: 'rgba(16, 185, 129, 0.15)', metric: `${products.length} cataloged` },
    { label: 'Supplier Network', desc: 'Oversee seaweed harvesters, processing plants, and MOQ logs', icon: Truck, path: '/business/suppliers', color: '#f59e0b', colorDim: 'rgba(245, 158, 11, 0.15)', metric: `${suppliers.length} active suppliers` },
    { label: 'Sales analytics', desc: 'View revenue indicators, funnel ratios, and B2B analytics dashboards', icon: TrendingUp, path: '/business/sales', color: '#ec4899', colorDim: 'rgba(236, 72, 153, 0.15)', metric: 'Analytical charts' }
  ];

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-accent" />
          KAFS Business Command (ERP)
        </h1>
        <p className="text-sm text-secondary">Kumar Agri & Food Systems — B2B Operations, ingredients formulation, and sales pipeline center.</p>
      </div>

      {/* Business KPIs */}
      <div className="kpi-grid">
        <KPICard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={Handshake} color="#10b981" colorDim="rgba(16, 185, 129, 0.15)" />
        <KPICard label="Weighted Pipeline" value={formatCurrency(pipelineValue)} icon={TrendingUp} color="#f59e0b" colorDim="rgba(245, 158, 11, 0.15)" />
        <KPICard label="Active Leads" value={activeLeadsCount} icon={UserPlus} color="#3b82f6" colorDim="rgba(59, 130, 246, 0.15)" />
        <KPICard label="Customer Base" value={activeCustomersCount} icon={Building2} color="#8b5cf6" colorDim="rgba(139, 92, 246, 0.15)" />
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {moduleLinks.map((mod) => (
          <Link to={mod.path} key={mod.label}>
            <Card interactive className="h-full flex flex-col justify-between">
              <div>
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" 
                  style={{ backgroundColor: mod.colorDim, color: mod.color }}
                >
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-primary text-base">{mod.label}</h3>
                <p className="text-xs text-secondary mt-1 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="text-xs font-mono font-bold mt-4 text-accent uppercase tracking-wider">{mod.metric}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
