'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { Briefcase, Users, Target, PhoneCall, DollarSign, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatters';

const MODULES = [
  { name: 'CRM Pipeline', desc: 'Manage active B2B leads', icon: Target, route: '/business/crm/leads', color: '#00B4D8' },
  { name: 'Contact DB', desc: 'B2B accounts & contacts', icon: Users, route: '/business/crm/contacts', color: '#8B5CF6' },
  { name: 'Sales Forecast', desc: 'Revenue pipeline projections', icon: DollarSign, route: '/business/sales/forecast', color: '#16A34A' },
];

export default function BusinessOS() {
  const leads = useLiveQuery(() => db.leads.toArray()) || [];
  const activeLeads = leads.filter(l => !['Customer', 'Lost'].includes(l.status));
  const pipelineValue = activeLeads.reduce((acc, l) => acc + (l.opportunityValue || 0), 0);
  
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-[#00B4D8]" />
            <span className="font-mono text-sm text-[#00B4D8] tracking-widest uppercase">Commercial Core</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Business OS
          </h1>
          <p className="text-zinc-400 mt-2 font-mono text-sm">
            Aqua Colloids ERP & CRM Engine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Total Pipeline</div>
          <div className="text-2xl font-bold text-[#00B4D8] truncate">{formatCurrency(pipelineValue)}</div>
        </div>
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4 !border-l-[#D4A017]">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Active Leads</div>
          <div className="text-3xl font-bold text-white">{activeLeads.length}</div>
        </div>
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4 !border-l-[#16A34A]">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-white">42%</div>
        </div>
        <div className="metric-card bg-[rgba(11,18,32,0.6)] !p-4 !border-l-[#8B5CF6]">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">Follow-ups Today</div>
          <div className="text-3xl font-bold text-white">3</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MODULES.map((mod) => (
            <Link key={mod.route} href={mod.route}>
              <div className="card hover:bg-[rgba(15,23,42,0.8)] cursor-pointer group transition-all flex flex-col h-full border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,180,216,0.3)]">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${mod.color}20`, color: mod.color }}
                >
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-200 group-hover:text-white mb-1">{mod.name}</h3>
                <p className="text-xs text-zinc-500 font-mono leading-relaxed">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="card-elevated !p-0 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-[rgba(0,180,216,0.1)] bg-[rgba(0,109,119,0.05)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-[#00B4D8]" />
              Action Required
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {activeLeads.slice(0,5).map(l => (
              <Link key={l.id} href={`/business/crm/leads`}>
                <div className="p-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-sm text-zinc-200 group-hover:text-white">{l.companyName}</div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-[#00B4D8] transition-colors" />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                    <span>{l.contactPerson}</span>
                    <span className="text-[#D4A017]">{formatCurrency(l.opportunityValue || 0)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
