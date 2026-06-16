'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  ChevronLeft, Users, Building2, Phone, Mail, FileText, Calendar,
  TrendingUp, Sparkles, AlertCircle, Plus, Save, Activity, Trash2, CheckCircle
} from 'lucide-react';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const leadId = parseInt(resolvedParams.id);

  const [noteText, setNoteText] = useState('');
  const [editingValue, setEditingValue] = useState(false);
  const [newValue, setNewValue] = useState('');

  // Live queries
  const lead = useLiveQuery(() => db.leads.get(leadId), [leadId]);
  const formulations = useLiveQuery(() => db.formulations.toArray()) ?? [];

  if (lead === undefined) {
    return (
      <div className="p-6 text-center text-zinc-550 font-mono">
        Loading lead telemetry...
      </div>
    );
  }

  if (lead === null) {
    return (
      <div className="p-6 text-center text-rose-400 font-mono">
        Error: Lead ID {leadId} not found in database.
        <div className="mt-4">
          <Link href="/business/crm/leads" className="text-zinc-400 hover:text-white underline">Return to Pipeline</Link>
        </div>
      </div>
    );
  }

  // Stage-based win rate configuration
  const STAGE_WIN_RATES: Record<string, number> = {
    'Lead': 10,
    'Contacted': 20,
    'Qualified': 40,
    'Sample Sent': 60,
    'Trial': 75,
    'Proposal': 90,
    'Customer': 100
  };

  const winRate = STAGE_WIN_RATES[lead.status] ?? 10;
  const weightedValue = Math.round(((lead.opportunityValue || 0) * winRate) / 100);

  // Generate next best actions
  const getNextBestAction = (status: string) => {
    switch (status) {
      case 'Lead': return 'Conduct initial B2B outreach and verify primary contact email.';
      case 'Contacted': return 'Schedule discovery call to isolate stabilizer requirements.';
      case 'Qualified': return 'Link KAFS Carrageenan formulation and arrange sample dispatch.';
      case 'Sample Sent': return 'Follow up regarding trial feedback window (due in 5 days).';
      case 'Trial': return 'Evaluate viscosity logs and prepare draft commercial proposal.';
      case 'Proposal': return 'Follow up with procurement team regarding quotation approval.';
      case 'Customer': return 'Initiate batch production planning and verify delivery lead times.';
      default: return 'Review CRM interaction timeline.';
    }
  };

  const handleUpdateStatus = async (status: string) => {
    await db.leads.update(leadId, { status: status as any });
  };

  const handleUpdateValue = async () => {
    const val = parseFloat(newValue);
    if (!isNaN(val) && val > 0) {
      await db.leads.update(leadId, { opportunityValue: val });
      setEditingValue(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const currentNotes = lead.notes ? lead.notes + '\n\n' : '';
    const newNoteBlock = `[${new Date().toLocaleDateString()}] ${noteText.trim()}`;
    
    await db.leads.update(leadId, {
      notes: currentNotes + newNoteBlock
    });
    setNoteText('');
  };

  const handleDeleteLead = async () => {
    if (!window.confirm('WARNING: Wiping this lead will remove it permanently. Continue?')) return;
    await db.leads.delete(leadId);
    window.location.href = '/business/crm/leads';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <Link href="/business/crm/leads" className="p-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#D4A017]" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 font-display">{lead.companyName}</h1>
            <span className="text-[9px] font-mono border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded uppercase tracking-wide">
              {lead.status}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Enterprise Client Profile & Forecast Telemetry
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main profile card */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Users className="w-4 h-4 text-blue-400" /> CONTACT & DEALS TELEMETRY
            </span>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Primary Contact</span>
                  <span className="text-zinc-200 text-sm font-semibold">{lead.contactPerson || 'None listed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-350">{lead.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-350">{lead.email || 'No email'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Product Interest</span>
                  <span className="text-zinc-350 bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 rounded inline-block mt-1">
                    {lead.productInterest || 'Custom stabilizer'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Unweighted Pipeline Value</span>
                  {editingValue ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        className="bg-zinc-950 border border-zinc-850 rounded px-2 py-1 text-zinc-300 font-mono w-32 focus:outline-none"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        placeholder="INR"
                      />
                      <button onClick={handleUpdateValue} className="p-1 hover:bg-zinc-900 rounded text-emerald-400"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingValue(false)} className="text-[10px] text-zinc-500 hover:text-white">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold font-mono text-zinc-100">₹{(lead.opportunityValue || 0).toLocaleString()}</span>
                      <button
                        onClick={() => { setEditingValue(true); setNewValue((lead.opportunityValue || 0).toString()); }}
                        className="text-[10px] text-[#00B4D8] hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Next Planned Follow-up</span>
                  <div className="flex items-center gap-1.5 text-zinc-350 mt-1 font-mono">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{lead.nextFollowUp || 'No scheduled date'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline advance action strip */}
            <div className="mt-6 border-t border-zinc-850 pt-4 space-y-3">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">Pipeline Stage Progression</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(STAGE_WIN_RATES).map((stage) => {
                  const isActive = lead.status === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => handleUpdateStatus(stage)}
                      className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-[#006D77] border-transparent text-white'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-750'
                      }`}
                    >
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Interaction timeline / Notes */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Activity className="w-4 h-4 text-purple-400" /> INTERACTION TIMELINE & NOTES
            </span>
          }>
            <div className="space-y-4">
              {/* Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Record call outcome, WhatsApp log, or meeting note..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8]"
                />
                <button
                  type="submit"
                  className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold font-mono flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> LOG NOTE
                </button>
              </form>

              {/* Logs */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {lead.notes ? (
                  lead.notes.split('\n\n').reverse().map((n, i) => (
                    <div key={i} className="p-3 border border-zinc-900 bg-zinc-950 rounded-lg text-xs leading-relaxed font-mono">
                      {n}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-600 italic text-xs font-mono">
                    No historic notes recorded. Log your first note above.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right column (AI Panel, Projections & Actions) */}
        <div className="space-y-6">
          {/* AI Win Assistant */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI WIN PROBABILITY ASSISTANT
            </span>
          }>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 border border-purple-900/30 rounded bg-purple-950/5">
                <div>
                  <span className="text-[10px] text-purple-400 font-mono font-bold block uppercase tracking-wider">Win Probability</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">{winRate}%</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/25 flex items-center justify-center font-bold text-[#00B4D8]">
                  {winRate}%
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono text-zinc-550 uppercase font-bold block">Next Best Action Recommendation</span>
                <p className="text-zinc-300 leading-relaxed mt-1">{getNextBestAction(lead.status)}</p>
              </div>

              <div>
                <span className="text-[9px] font-mono text-zinc-550 uppercase font-bold block">Conversational Summary Insight</span>
                <p className="text-zinc-500 leading-relaxed mt-1 font-serif italic">
                  "Client is evaluating Carrageenan stabilizers for dairy blends. FSSAI limit compliance is critical for approval. Follow-up regarding sample v3 dispatch."
                </p>
              </div>
            </div>
          </Card>

          {/* Revenue contribution details */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> REVENUE FORECAST CONVERSION
            </span>
          }>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-500 uppercase">Gross Deal Value</span>
                <span className="text-zinc-300">₹{(lead.opportunityValue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-500 uppercase">Stage Win Rate</span>
                <span className="text-zinc-300">{winRate}%</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-[#00B4D8] uppercase">Weighted Value</span>
                <span className="text-emerald-400">₹{weightedValue.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Danger zone / Delete */}
          <Card header={
            <span className="text-rose-400 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-500" /> SYSTEM ADMIN CONTROLS
            </span>
          }>
            <div className="space-y-2 text-xs">
              <p className="text-[10px] text-zinc-600 leading-normal font-mono">
                Deleting this lead will completely wipe its records, follow-ups, and forecast contribution indices from sandbox.
              </p>
              <button
                onClick={handleDeleteLead}
                className="w-full bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 py-2 rounded text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> DELETE LEAD RECORD
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
