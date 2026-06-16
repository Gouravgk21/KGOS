'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Lead } from '@/db/database';
import { useCRMStore } from '@/store/useCRMStore';
import Card from '@/components/ui/Card';
import { UserPlus, Plus, Search, Trash2, Edit, Mail, Phone, Calendar, ArrowRight, Kanban, List } from 'lucide-react';
import { LEAD_STAGES } from '@/utils/constants';

const STAGES: Lead['status'][] = ['Lead', 'Contacted', 'Qualified', 'Sample Sent', 'Trial', 'Proposal', 'Customer'];

const STAGE_COLORS: Record<Lead['status'], { border: string; bg: string; text: string }> = {
  'Lead': { border: 'border-zinc-800', bg: 'bg-zinc-900/40', text: 'text-zinc-400' },
  'Contacted': { border: 'border-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  'Qualified': { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'Sample Sent': { border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  'Trial': { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'Proposal': { border: 'border-orange-500/20', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  'Customer': { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
};

export default function CRMPage() {
  const leads = useLiveQuery(() => db.leads.toArray()) || [];
  const { addLead, updateLead, deleteLead } = useCRMStore();

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productInterest, setProductInterest] = useState('');
  const [status, setStatus] = useState<Lead['status']>('Lead');
  const [notes, setNotes] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const data = {
      companyName,
      contactPerson,
      phone,
      email,
      productInterest,
      status,
      notes,
      nextFollowUp: nextFollowUp || undefined
    };

    if (editId !== null) {
      await updateLead(editId, data);
      setEditId(null);
    } else {
      await addLead(data);
    }

    // Reset Form
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setProductInterest('');
    setStatus('Lead');
    setNotes('');
    setNextFollowUp('');
    setIsFormOpen(false);
  };

  const handleEdit = (lead: Lead) => {
    if (lead.id === undefined) return;
    setEditId(lead.id);
    setCompanyName(lead.companyName);
    setContactPerson(lead.contactPerson);
    setPhone(lead.phone || '');
    setEmail(lead.email || '');
    setProductInterest(lead.productInterest || '');
    setStatus(lead.status);
    setNotes(lead.notes || '');
    setNextFollowUp(lead.nextFollowUp || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (id === undefined) return;
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(id);
    }
  };

  const handleMoveStage = async (id: number | undefined, nextStage: Lead['status']) => {
    if (id === undefined) return;
    await updateLead(id, { status: nextStage });
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.productInterest && lead.productInterest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-500" />
            KAFS B2B CRM Pipeline
          </h1>
          <p className="text-sm text-zinc-400">Manage client relationships, sample kits, formulation trials, and deals.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {isFormOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">{editId !== null ? 'Modify Client Lead' : 'Register New Client Lead'}</span>}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                  placeholder="e.g. Kwality Confectionery"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                  placeholder="name@company.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Product / Formula Interest</label>
                <input
                  type="text"
                  value={productInterest}
                  onChange={(e) => setProductInterest(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                  placeholder="e.g. Kappa Carrageenan stabilizer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Pipeline Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Lead['status'])}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Next Follow Up Date</label>
                <input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-400 focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Activity Logs & Internal Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700 h-24 resize-none"
                placeholder="Details of sample tests, price queries, packaging specifications..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Lead
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center border-b border-zinc-800 pb-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, or interest..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none focus:border-zinc-700"
          />
        </div>

        {/* View Selectors */}
        <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850 self-end md:self-auto">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'kanban' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Pipeline Board
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List View
          </button>
        </div>
      </div>

      {/* Pipeline Board */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);
            const stageConfig = STAGE_COLORS[stage];
            return (
              <div key={stage} className="flex flex-col gap-3 min-w-[200px] bg-zinc-950/20 border border-zinc-900 p-3 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <span className="text-xs font-bold text-zinc-350">{stage}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-850">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
                  {stageLeads.length > 0 ? (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`p-3 rounded-lg border bg-zinc-900/40 hover:bg-zinc-900/80 transition-all flex flex-col gap-2 ${stageConfig.border}`}
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-200">{lead.companyName}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{lead.contactPerson}</div>
                        </div>

                        {lead.productInterest && (
                          <div className="text-[10px] bg-zinc-950 px-2 py-1 rounded border border-zinc-850 text-zinc-400 w-fit">
                            {lead.productInterest}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-zinc-850/60 pt-2 mt-1">
                          <button
                            onClick={() => handleEdit(lead)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-200 transition-colors"
                          >
                            Edit
                          </button>
                          <div className="flex gap-1">
                            {stage !== 'Customer' && (
                              <button
                                onClick={() => {
                                  const currentIdx = STAGES.indexOf(stage);
                                  handleMoveStage(lead.id, STAGES[currentIdx + 1]);
                                }}
                                className="text-zinc-500 hover:text-blue-400 p-0.5"
                                title="Move Forward"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="text-zinc-500 hover:text-rose-400 p-0.5"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-center text-zinc-650 py-6">Empty stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="p-3 font-semibold">Company</th>
                  <th className="p-3 font-semibold">Contact Person</th>
                  <th className="p-3 font-semibold">Product Interest</th>
                  <th className="p-3 font-semibold">Stage</th>
                  <th className="p-3 font-semibold">Contact Details</th>
                  <th className="p-3 font-semibold">Next Action</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    const stageColors = STAGE_COLORS[lead.status];
                    return (
                      <tr key={lead.id} className="hover:bg-zinc-900/20 text-zinc-300">
                        <td className="p-3 font-bold text-zinc-100">{lead.companyName}</td>
                        <td className="p-3">{lead.contactPerson}</td>
                        <td className="p-3">
                          {lead.productInterest ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px]">
                              {lead.productInterest}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${stageColors.bg} ${stageColors.text} border ${stageColors.border}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {lead.email && (
                              <span className="flex items-center gap-1.5 text-zinc-400">
                                <Mail className="w-3 h-3 text-zinc-500" /> {lead.email}
                              </span>
                            )}
                            {lead.phone && (
                              <span className="flex items-center gap-1.5 text-zinc-400">
                                <Phone className="w-3 h-3 text-zinc-500" /> {lead.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {lead.nextFollowUp ? (
                            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                              <Calendar className="w-3 h-3" /> {lead.nextFollowUp}
                            </span>
                          ) : (
                            <span className="text-zinc-600">No scheduled follow-up</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(lead)}
                              className="text-zinc-500 hover:text-zinc-200 p-1"
                              title="Edit Lead"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      No leads matching queries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
