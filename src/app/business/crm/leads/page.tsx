'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { Target, Plus, Search, Filter, MoreVertical, Phone, Mail, Building2, UserCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const STAGES = ['Lead', 'Contacted', 'Qualified', 'Sample Sent', 'Trial', 'Proposal', 'Customer'];

export default function CRMLeads() {
  const leads = useLiveQuery(() => db.leads.toArray()) || [];
  const [search, setSearch] = useState('');
  
  // Quick Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<{
    companyName: string;
    contactPerson: string;
    status: 'Lead' | 'Contacted' | 'Qualified' | 'Sample Sent' | 'Trial' | 'Proposal' | 'Customer';
    opportunityValue: number;
  }>({ companyName: '', contactPerson: '', status: 'Lead', opportunityValue: 0 });

  const filtered = leads.filter(l => 
    l.companyName?.toLowerCase().includes(search.toLowerCase()) || 
    l.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const getLeadsByStage = (stage: string) => {
    return filtered.filter(l => l.status === stage);
  };

  const handleSaveLead = async () => {
    if (newLead.companyName) {
      await db.leads.add({
        ...newLead,
        // Populate alias fields so both `company` and `companyName` are set
        company: newLead.companyName,
        contact: newLead.contactPerson,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewLead({ companyName: '', contactPerson: '', status: 'Lead', opportunityValue: 0 });
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-[#00B4D8]" />
            <span className="font-mono text-sm text-[#00B4D8] tracking-widest uppercase">CRM Pipeline</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Lead Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00B4D8] text-sm transition-colors"
            />
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4 scrollbar-thin">
        {STAGES.map(stage => {
          const stageLeads = getLeadsByStage(stage);
          const stageValue = stageLeads.reduce((acc, l) => acc + (l.opportunityValue || 0), 0);
          
          return (
            <div key={stage} className="min-w-[280px] w-[280px] flex flex-col gap-3 h-full bg-[rgba(15,23,42,0.3)] rounded-xl border border-[rgba(255,255,255,0.02)] p-2">
              <div className="flex items-center justify-between p-2">
                <h3 className="font-bold text-zinc-200 text-sm tracking-wide">{stage}</h3>
                <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">{stageLeads.length}</span>
              </div>
              <div className="px-2 text-[10px] font-mono text-[#D4A017] uppercase font-bold tracking-wider mb-2">
                {formatCurrency(stageValue)}
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
                {stageLeads.map(lead => (
                  <div key={lead.id} className="bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,180,216,0.3)] p-3 rounded-lg cursor-pointer transition-colors group shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-white group-hover:text-[#00B4D8] transition-colors line-clamp-1">{lead.companyName}</div>
                      <MoreVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
                      <UserCircle2 className="w-3.5 h-3.5" />
                      <span className="truncate">{lead.contactPerson || 'Unknown Contact'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto border-t border-zinc-800 pt-2">
                      <span className="text-xs font-mono font-bold text-[#D4A017]">{formatCurrency(lead.opportunityValue || 0)}</span>
                      <div className="flex gap-1">
                        {lead.phone && <Phone className="w-3.5 h-3.5 text-zinc-500 hover:text-green-500" />}
                        {lead.email && <Mail className="w-3.5 h-3.5 text-zinc-500 hover:text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[rgba(0,180,216,0.2)] rounded-xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Create New Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1 block">Company Name</label>
                <input type="text" value={newLead.companyName} onChange={e => setNewLead({...newLead, companyName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1 block">Contact Person</label>
                <input type="text" value={newLead.contactPerson} onChange={e => setNewLead({...newLead, contactPerson: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1 block">Opportunity Value (INR)</label>
                <input type="number" value={newLead.opportunityValue} onChange={e => setNewLead({...newLead, opportunityValue: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono uppercase mb-1 block">Stage</label>
                <select value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value as any})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white">
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex justify-end gap-2 bg-zinc-900/50">
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveLead}>Save Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
