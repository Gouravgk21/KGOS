'use client';

import React from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  FlaskConical, Network, Target, Factory, FileBadge, CheckCircle, 
  ChevronRight, Beaker, Zap, PlayCircle, BarChart3, Database
} from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

const MODULES = [
  { name: 'Formulation Lab', desc: 'Create & optimize food tech recipes', icon: FlaskConical, route: '/formulation-lab', color: '#00B4D8' },
  { name: 'Hydrocolloid Center', desc: 'Properties, synergies & specs', icon: Network, route: '/kafs/hydrocolloids', color: '#8B5CF6' },
  { name: 'Ingredients DB', desc: 'Raw material intel & pricing', icon: Database, route: '/kafs/ingredients', color: '#D4A017' },
  { name: 'Manufacturing OS', desc: 'Batch records & QA protocols', icon: Factory, route: '/kafs/manufacturing', color: '#16A34A' },
  { name: 'Patent Intel', desc: 'IP tracking & white space analysis', icon: FileBadge, route: '/kafs/patents', color: '#EC4899' },
];

export default function KAFSCommandCenter() {
  const formulations = useLiveQuery(() => db.formulations.toArray()) || [];
  const activeForms = formulations.filter(f => f.status === 'Active');
  
  const batchRecords = useLiveQuery(() => db.batchRecords.toArray()) || [];
  const activeBatches = batchRecords.filter(b => b.status === 'In Progress' || b.status === 'Planned');

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-[rgba(0,180,216,0.1)] pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Beaker className="w-5 h-5 text-[#006D77]" />
            <span className="font-mono text-sm text-[#006D77] tracking-widest uppercase">Science Core</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            KAFS Command Center
          </h1>
          <p className="text-zinc-400 mt-2 font-mono text-sm">
            Kumar Advanced Food Systems • R&D Operating System
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Active Formulations</div>
          <div className="text-3xl font-bold text-white">{activeForms.length}</div>
        </div>
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4 !border-l-[#8B5CF6]">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Total Models</div>
          <div className="text-3xl font-bold text-white">{formulations.length}</div>
        </div>
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4 !border-l-[#16A34A]">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Active Batches</div>
          <div className="text-3xl font-bold text-white">{activeBatches.length}</div>
        </div>
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4 !border-l-[#D4A017]">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Patent White spaces</div>
          <div className="text-3xl font-bold text-white">4</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Modules Nav */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((mod) => (
            <Link key={mod.route} href={mod.route}>
              <div className="card hover:bg-[rgba(15,23,42,0.8)] cursor-pointer group transition-all flex items-start gap-4 border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,180,216,0.3)] h-full">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${mod.color}20`, color: mod.color }}
                >
                  <mod.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-200 group-hover:text-white mb-1">{mod.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Live Telemetry / Actions */}
        <div className="flex flex-col gap-4">
          <div className="card-elevated !p-0 overflow-hidden flex flex-col flex-1 min-h-[300px]">
            <div className="p-4 border-b border-[rgba(0,180,216,0.1)] bg-[rgba(0,109,119,0.05)]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-[#D4A017]" />
                Recent Formulations
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {formulations.slice(-5).reverse().map((f) => (
                <Link key={f.id} href={`/formulation-lab/${f.id}`}>
                  <div className="p-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors flex justify-between items-center group">
                    <div>
                      <div className="text-sm font-medium text-zinc-200 group-hover:text-[#00B4D8] transition-colors">{f.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">v{f.version} • {f.targetApplication}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#00B4D8] transition-colors" />
                  </div>
                </Link>
              ))}
              {formulations.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">No formulations yet.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
