'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  FlaskConical, Plus, Save, Sparkles, Filter, Search, Calendar,
  Clock, CheckCircle, AlertCircle, ChevronRight, ClipboardList, Send, Edit
} from 'lucide-react';

export default function SamplesPage() {
  const [showForm, setShowForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [selectedFormulationId, setSelectedFormulationId] = useState('');
  const [sampleQuantity, setSampleQuantity] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [status, setStatus] = useState('Planned');
  const [trialOutcome, setTrialOutcome] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSample, setEditingSample] = useState<any | null>(null);

  // Live queries
  const formulations = useLiveQuery(() => db.formulations.toArray()) ?? [];
  const samples = useLiveQuery(async () => {
    const raw = await db.sampleRequests.toArray();
    const forms = await db.formulations.toArray();
    return raw.map(s => {
      const matchedForm = forms.find(f => f.id === s.formulationId);
      return {
        ...s,
        formulationName: matchedForm ? matchedForm.name : 'Custom blend'
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }) ?? [];

  const handleSaveSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !selectedFormulationId) return;

    try {
      await db.sampleRequests.add({
        clientName: clientName.trim(),
        formulationId: parseInt(selectedFormulationId),
        quantity: sampleQuantity.trim(),
        dispatchDate,
        status: status as any,
        applicationCategory: 'General',
        trialOutcome: trialOutcome.trim(),
        createdAt: new Date().toISOString()
      });

      // Reset
      setClientName('');
      setSelectedFormulationId('');
      setSampleQuantity('');
      setDispatchDate('');
      setStatus('Planned');
      setTrialOutcome('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to log sample request:', err);
    }
  };

  const handleUpdateStatus = async (sample: any, newStatus: string) => {
    try {
      await db.sampleRequests.update(sample.id, {
        status: newStatus as any
      });
    } catch (err) {
      console.error('Failed to update sample status:', err);
    }
  };

  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSample) return;

    try {
      await db.sampleRequests.update(editingSample.id, {
        trialOutcome: trialOutcome.trim()
      });
      setEditingSample(null);
      setTrialOutcome('');
    } catch (err) {
      console.error('Failed to update trial outcome:', err);
    }
  };

  // Filter list
  const filteredSamples = samples.filter(s => {
    const matchesSearch = s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.formulationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalDispatched = samples.length;
  const activeTrials = samples.filter(s => (s.status as string) === 'Trial Active' || (s.status as string) === 'Delivered').length;
  const trialSuccesses = samples.filter(s => s.trialOutcome && (s.trialOutcome.toLowerCase().includes('approved') || s.trialOutcome.toLowerCase().includes('success'))).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <FlaskConical className="w-6 h-6 text-[#00B4D8]" /> B2B SAMPLE LOGS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Track commercial sample dispatches, monitor shipping status, and log trial outcomes.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'CLOSE FORM' : 'LOG NEW SAMPLE'}
        </button>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00B4D8]" />
          <Send className="w-8 h-8 text-[#00B4D8]/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Dispatched Samples</span>
            <span className="text-lg font-bold font-mono text-white mt-1">{totalDispatched} dispatches</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <Clock className="w-8 h-8 text-amber-500/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Product Trials</span>
            <span className="text-lg font-bold font-mono text-white mt-1">{activeTrials} trials running</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CheckCircle className="w-8 h-8 text-emerald-500/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Approved Outcomes</span>
            <span className="text-lg font-bold font-mono text-white mt-1">{trialSuccesses} conversions</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Workspace: Sample Forms & Requests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* New Sample Form */}
          {showForm && (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Plus className="w-4 h-4 text-[#00B4D8]" /> CREATE SAMPLE DISPATCH SHEET
              </span>
            }>
              <form onSubmit={handleSaveSample} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Client / Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Heritage Foods"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Linked Formulation</label>
                    <select
                      value={selectedFormulationId}
                      onChange={e => setSelectedFormulationId(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
                    >
                      <option value="">-- Select KAFS Stabilizer --</option>
                      {formulations.map(form => (
                        <option key={form.id} value={form.id}>{form.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Quantity (kg)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0.50 kg"
                      value={sampleQuantity}
                      onChange={e => setSampleQuantity(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Dispatch Date</label>
                    <input
                      type="date"
                      value={dispatchDate}
                      onChange={e => setDispatchDate(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
                    >
                      <option value="Planned">Planned</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Trial Active">Trial Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Trial Outcome / Initial Feedback</label>
                  <textarea
                    placeholder="Enter outcomes or trial feedback..."
                    value={trialOutcome}
                    onChange={e => setTrialOutcome(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    SAVE DISPATCH
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search sample requests by client or product..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 uppercase font-mono text-[10px]">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Planned">Planned</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Trial Active">Trial Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Active Dispatches List */}
          <div className="space-y-4">
            {filteredSamples.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 font-mono flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-700" />
                <p className="text-xs uppercase tracking-wider">No sample dispatches logged.</p>
                <p className="text-[10px] lowercase text-zinc-650">Create new requests via Log New Sample.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSamples.map(sample => (
                  <div key={sample.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-950 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{sample.clientName}</h3>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">
                           stabilizer: <span className="text-zinc-200">{sample.formulationName}</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          (sample.status as string) === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          (sample.status as string) === 'Trial Active' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}>
                          {sample.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[10px] font-mono text-zinc-500 pt-1">
                      <div>
                        <span className="text-zinc-600 block uppercase">Quantity</span>
                        <span className="text-zinc-300 font-bold block mt-0.5">{sample.quantity}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase">Dispatch Date</span>
                        <span className="text-zinc-300 font-bold block mt-0.5">{sample.dispatchDate}</span>
                      </div>
                      <div className="flex justify-end items-end gap-1.5">
                        {/* Status update select */}
                        <select
                          value={sample.status}
                          onChange={e => handleUpdateStatus(sample, e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-1.5 py-0.5 text-[9px] focus:outline-none"
                        >
                          <option value="Planned">Set Planned</option>
                          <option value="Dispatched">Set Dispatched</option>
                          <option value="In Transit">Set Transit</option>
                          <option value="Delivered">Set Delivered</option>
                          <option value="Trial Active">Set Trial</option>
                          <option value="Completed">Set Completed</option>
                        </select>
                      </div>
                    </div>

                    {sample.trialOutcome && (
                      <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-850 text-xs">
                        <span className="text-[9px] font-mono text-zinc-550 uppercase block mb-1">Trial Feedback Logs</span>
                        <p className="text-zinc-300 italic">"{sample.trialOutcome}"</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => { setEditingSample(sample); setTrialOutcome(sample.trialOutcome || ''); }}
                        className="text-zinc-400 hover:text-white flex items-center gap-1 font-mono text-[9px] cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Log Outcome
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Outcomes Editor */}
        <div className="lg:col-span-1">
          {editingSample ? (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
                <ClipboardList className="w-4 h-4 text-[#D4A017]" /> LOG TRIAL FEEDBACK
              </span>
            }>
              <form onSubmit={handleUpdateOutcome} className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Client Name</span>
                  <span className="text-zinc-200 text-sm font-semibold block mt-0.5">{editingSample.clientName}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Trial Outcomes / Feedback</label>
                  <textarea
                    placeholder="e.g. Viscosity approved. Gel texture satisfied dairy standards. Moving to bulk commercial pricing."
                    value={trialOutcome}
                    onChange={e => setTrialOutcome(e.target.value)}
                    rows={6}
                    required
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditingSample(null); setTrialOutcome(''); }}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    LOG FEEDBACK
                  </button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-650 font-mono flex flex-col items-center gap-2">
              <ClipboardList className="w-8 h-8 text-zinc-800" />
              <p className="text-xs uppercase tracking-wider">No trial editor active</p>
              <p className="text-[10px] lowercase text-zinc-650">Select "Log Outcome" on any sample dispatch card.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
