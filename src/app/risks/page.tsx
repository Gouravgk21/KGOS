'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SystemRisk {
  id: number;
  label: string;
  category: 'BURNOUT' | 'REVENUE' | 'HEALTH' | 'CAREER' | 'RESEARCH';
  severity: 'CRITICAL' | 'WARNING' | 'STABLE';
  remedy: string;
}

export default function RiskEnginePage() {
  const [risks, setRisks] = useState<SystemRisk[]>([
    { id: 1, label: "Burnout Threshold Approaching", category: "BURNOUT", severity: "WARNING", remedy: "Reduce active target priorities. Ensure next 2 days include minimum 7h sleep." },
    { id: 2, label: "FSSAI Preparation Lag Detected", category: "CAREER", severity: "CRITICAL", remedy: "Mock scores dropped below 75% target threshold. Schedule 2 focus sessions today." },
    { id: 3, label: "Financial Cash Flow Health", category: "REVENUE", severity: "STABLE", remedy: "No immediate action. Strategic cash reserves cover next 6 months of operations." }
  ]);

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          System Risk Engine
        </h1>
        <p className="text-sm text-zinc-400">Real-time risk audit engine analyzing physical burnout indexes, cash-burn velocity, and academic preparation delays.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {risks.map((r) => (
          <Card key={r.id} header={
            <div className="flex justify-between items-center w-full">
              <span className="text-zinc-200 font-semibold">{r.label}</span>
              <span className={`px-2 py-0.5 text-[9px] font-mono rounded border uppercase ${
                r.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                r.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {r.severity}
              </span>
            </div>
          }>
            <div className="flex flex-col gap-3 text-xs text-zinc-400">
              <div className="flex justify-between items-center text-[10px]">
                <span>Risk Domain</span>
                <span className="font-semibold text-zinc-300">{r.category}</span>
              </div>

              <div className="border-t border-zinc-850 pt-3">
                <span className="text-[10px] text-zinc-500 font-bold block mb-1">Recommended Remedy / Pivot</span>
                <p className="leading-relaxed text-zinc-300">{r.remedy}</p>
              </div>

              {r.severity !== 'STABLE' && (
                <div className="flex gap-2 items-center bg-rose-500/5 p-2 rounded border border-rose-500/10 text-[10px] text-rose-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Core Diagnostic Warning Issued
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
