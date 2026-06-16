'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import KPICard from '@/components/ui/KPICard';
import { 
  TrendingUp, Sparkles, Building2, Send, Copy, Check, 
  MessageSquare, FileText, BarChart2, DollarSign, Target, Award, Briefcase
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import Link from 'next/link';

export default function SalesIntelligencePage() {
  const leads = useLiveQuery(() => db.leads.toArray()) ?? [];
  const products = useLiveQuery(() => db.products.toArray()) ?? [];

  // Form states for AI Outreach Generator
  const [selectedProduct, setSelectedProduct] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('Dairy');
  const [outreachTone, setOutreachTone] = useState('Technical');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Computations
  const salesMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const closedWon = leads.filter(l => l.status === 'Customer' || l.stage === 'CUSTOMER');
    const closedWonVal = closedWon.reduce((s, l) => s + (l.opportunityValue ?? 0), 0);
    const activePipelineVal = leads
      .filter(l => l.status !== 'Customer')
      .reduce((s, l) => s + (l.opportunityValue ?? 0), 0);

    const conversionRate = totalLeads > 0 ? (closedWon.length / totalLeads) * 100 : 0;
    
    return {
      pipelineValue: activePipelineVal,
      closedWonValue: closedWonVal,
      conversionRate,
      activeCount: totalLeads - closedWon.length
    };
  }, [leads]);

  // Forecast Data (3 Quarters)
  const forecastData = useMemo(() => {
    const pipe = salesMetrics.pipelineValue;
    return [
      { name: 'Q3 2026 (Est)', Pipeline: Math.round(pipe * 0.4), Forecasted: Math.round(pipe * 0.25) },
      { name: 'Q4 2026 (Est)', Pipeline: Math.round(pipe * 0.6), Forecasted: Math.round(pipe * 0.35) },
      { name: 'Q1 2027 (Est)', Pipeline: Math.round(pipe * 0.9), Forecasted: Math.round(pipe * 0.50) }
    ];
  }, [salesMetrics.pipelineValue]);

  // AI Outreach generator simulator
  const generateOutreach = () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }
    setIsGenerating(true);
    setCopied(false);

    // Simulate small timing
    setTimeout(() => {
      const prodName = products.find(p => p.id === Number(selectedProduct))?.name || 'Stabilizer Blend';
      let script = '';

      if (outreachTone === 'Technical') {
        script = `Subject: Technical Rheological Assessment: Optimizing Viscosity Profile for ${targetIndustry} processing

Dear Procurement and R&D Teams,

I hope this email finds you well. 

My name is Kumar Gourav, Agricultural Engineer and Food Technologist at Kumar Agri & Food Systems (KAFS). We specialize in biopolymer synergies and custom stabilizer blends, specifically seaweed-derived hydrocolloids.

I have been analyzing the syneresis and heat-shock texture degradation parameters common in ${targetIndustry} processing. We developed a proprietary blend, ${prodName}, which optimizes Kappa/Iota Carrageenan ratios alongside galactomannans to ensure:

1. High-viscosity stability during thermal pasteurization loops.
2. Perfect whey/fluid retention under freeze-thaw profiles.
3. Dose reduction down to 0.18% - 0.22% wt, yielding up to a 15% reduction in overall stabilizer CapEx relative to import blends.

We would be glad to ship a 5kg test sample for dry-blending rheological viscometry trials in your pilot plant. Let me know if you would like me to dispatch the product specification sheets.

Best regards,

Kumar Gourav
Founder & Hydrocolloids Specialist
KAFS (Kumar Agri & Food Systems)
m: +91 99999 88888 | e: kgourav@kafs.in`;
      } else if (outreachTone === 'Value-Focused') {
        script = `Subject: Stabilizer cost reduction and quality assurance in ${targetIndustry} manufacturing

Dear Operations Lead,

I am writing to share a cost-in-use formulation breakthrough that has helped regional processors lower ingredient costs by 12-18% while enhancing product texture.

At KAFS, we produce ${prodName}, a high-performance food stabilizer blend. In ${targetIndustry} applications, stabilizer dosage is often over-formulated due to raw material variation. Our blend delivers stable viscosity at lower inclusions, saving formulation costs without sacrificing mouthfeel.

Could we schedule a brief 10-minute technical review next week to discuss your current stabilization metrics and arrange for sample evaluation?

Best regards,

Kumar Gourav
Founder, KAFS
e: kgourav@kafs.in`;
      } else {
        script = `Subject: Collaboration: Sourcing high-grade hydrocolloids for ${targetIndustry}

Hi,

I hope you are having a productive week.

I have been following your progress in the ${targetIndustry} sector. At KAFS, we are working with processing plants across India to secure supply chains for high-purity Carrageenan and Locust Bean Gum stabilizer blends.

Our newest formulation, ${prodName}, has shown excellent mouthfeel parameters in trials. I would love to connect with your R&D lead to see if we can support your upcoming product development pipeline. 

Are you available for a quick introductory call?

Best,

Kumar Gourav
Founder, KAFS`;
      }

      setGeneratedScript(script);
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <Link href="/business" className="hover:text-zinc-300">KAFS ERP</Link>
            <span>/</span>
            <span className="text-zinc-400">Sales Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 mt-1">
            <TrendingUp className="w-6 h-6 text-blue-500" /> B2B Sales Intelligence
          </h1>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Pipeline Value"
          value={formatCurrency(salesMetrics.pipelineValue)}
          trend="positive"
          trendValue={`${salesMetrics.activeCount} Open B2B Deals`}
          icon={TrendingUp}
          color="#3b82f6"
        />
        <KPICard
          label="Closed Won Revenue"
          value={formatCurrency(salesMetrics.closedWonValue)}
          trend="positive"
          trendValue="Realized B2B Sales"
          icon={Award}
          color="#10b981"
        />
        <KPICard
          label="Lead Conversion Rate"
          value={`${salesMetrics.conversionRate.toFixed(1)}%`}
          trend="positive"
          trendValue="Closed Won / Total"
          icon={Target}
          color="#ec4899"
        />
        <KPICard
          label="Total Pipeline Contracts"
          value={leads.length}
          trend="neutral"
          trendValue="All leads captured"
          icon={Briefcase}
          color="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Outreach Generator (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Sales Outreach Generator
            </span>
          }>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Select KAFS Product</label>
                  <select
                    value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">-- Choose Blend --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Industry</label>
                  <select
                    value={targetIndustry}
                    onChange={e => setTargetIndustry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Dairy">Dairy Processing</option>
                    <option value="Confectionery">Confectionery (Gummies)</option>
                    <option value="Bakery">Bakery Stabilizers</option>
                    <option value="Meat Processing">Meat Processing binder</option>
                    <option value="Beverages">Beverage Clarification</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Outreach Tone</label>
                  <select
                    value={outreachTone}
                    onChange={e => setOutreachTone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Technical">Technical & Rheological</option>
                    <option value="Value-Focused">Value & Cost-in-Use</option>
                    <option value="Direct">Direct Sourcing Pitch</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateOutreach}
                disabled={isGenerating || !selectedProduct}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-850 disabled:text-zinc-650 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow"
              >
                {isGenerating ? 'Analyzing rheological parameters...' : 'Compile Technical Outreach Draft'}
              </button>

              {generatedScript && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center bg-zinc-900 border-b border-zinc-850 px-3 py-1.5 rounded-t-lg">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Compiled Output</span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {copied ? (
                        <><Check className="w-3 h-3 text-emerald-400" /> Copied!</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy Script</>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={generatedScript}
                    className="w-full h-80 bg-zinc-950 border border-zinc-850 rounded-b-lg p-4 font-mono text-xs text-zinc-350 focus:outline-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sales Forecast & Funnel (1 col) */}
        <div className="space-y-6">
          <Card header={<span className="text-zinc-200 font-semibold">Weighted Revenue Forecast</span>}>
            {leads.length === 0 ? (
              <div className="text-xs text-zinc-500">No active forecast metrics.</div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Projections based on weighted probability values derived from the CRM Pipeline.
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ background: '#09090b', borderColor: '#27272a' }} 
                        labelStyle={{ color: '#e4e4e7', fontSize: 11 }}
                        itemStyle={{ fontSize: 11 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Pipeline" name="Total Pipeline" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Forecasted" name="Weighted Forecast" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>

          <Card header={<span className="text-zinc-200 font-semibold">Opportunity Pipeline Index</span>}>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-850">
                <span className="text-zinc-400">Total B2B Leads</span>
                <span className="font-bold text-zinc-200">{leads.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-850">
                <span className="text-zinc-400">Samples Evaluated</span>
                <span className="font-bold text-zinc-200">
                  {leads.filter(l => l.status === 'Sample Sent' || l.status === 'Trial').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-850">
                <span className="text-zinc-400">Avg Deal Size</span>
                <span className="font-bold text-zinc-200">
                  {formatCurrency(
                    leads.length > 0 
                      ? Math.round(leads.reduce((s, l) => s + (l.opportunityValue ?? 0), 0) / leads.length)
                      : 0
                  )}
                </span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
