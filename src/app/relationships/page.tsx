'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db, type Contact } from '@/db/database';
import { useContactStore } from '@/store/useContactStore';
import {
  Users, Plus, Phone, Mail, Calendar, Star, Trash2,
  MessageCircle, ChevronDown, ChevronUp, Search
} from 'lucide-react';

const ROLES: Contact['role'][] = [
  'Family', 'Friends', 'Mentors', 'Recruiters', 'Customers', 'Researchers', 'Experts', 'Advisors'
];

const ROLE_COLORS: Record<Contact['role'], string> = {
  Family:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Friends:     'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Mentors:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Recruiters:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Customers:   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Researchers: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Experts:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Advisors:    'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score / 20); // 1-5 dots from 1-100
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${i < filled ? 'bg-pink-500' : 'bg-zinc-800'}`}
        />
      ))}
    </div>
  );
}

export default function RelationshipsPage() {
  const contacts = useLiveQuery(() =>
    db.contacts.orderBy('interactionScore').reverse().toArray()
  ) ?? [];

  const { addContact, deleteContact } = useContactStore();

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<Contact['role']>('Customers');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formScore, setFormScore] = useState('60');
  const [formLastContact, setFormLastContact] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formNotes, setFormNotes] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    await addContact({
      name: formName.trim(),
      role: formRole,
      email: formEmail || undefined,
      phone: formPhone || undefined,
      interactionScore: parseInt(formScore) || 60,
      lastContact: formLastContact,
      notes: formNotes || undefined,
    });
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormScore('60');
    setFormNotes('');
    setIsAddOpen(false);
  };

  const filtered = contacts.filter(c => {
    const matchRole = filterRole === 'ALL' || c.role === filterRole;
    const matchSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  // Stats
  const totalScore = contacts.length
    ? Math.round(contacts.reduce((sum, c) => sum + c.interactionScore, 0) / contacts.length)
    : 0;

  const due = contacts.filter(c => {
    const daysSince = Math.floor((Date.now() - new Date(c.lastContact).getTime()) / 86400000);
    return daysSince > 14;
  });

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" />
            Relationship Capital
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Score, track, and nurture vital personal and professional contacts.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Contacts', value: contacts.length, color: 'text-pink-400' },
          { label: 'Avg. Interaction Score', value: `${totalScore}/100`, color: 'text-amber-400' },
          { label: 'Overdue Follow-Ups', value: due.length, color: due.length > 0 ? 'text-rose-400' : 'text-emerald-400' },
        ].map(k => (
          <Card key={k.label} header={null}>
            <div className="text-center py-1">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Form */}
      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Contact</span>}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-pink-600"
                  placeholder="e.g. Dr. Ankit Mehta"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as Contact['role'])}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-pink-600"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Interaction Score (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formScore}
                  onChange={e => setFormScore(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-pink-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-pink-600"
                  placeholder="email@domain.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-pink-600"
                  placeholder="+91 9999..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Last Contact Date</label>
                <input
                  type="date"
                  value={formLastContact}
                  onChange={e => setFormLastContact(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-300 focus:border-pink-600"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Notes</label>
              <textarea
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={2}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-pink-600 resize-none"
                placeholder="Key context, shared interests, action items..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white"
              >
                Save Contact
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-700"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', ...ROLES].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-colors ${
                filterRole === role
                  ? 'bg-pink-600 border-pink-500 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Alert */}
      {due.length > 0 && (
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div className="text-xs text-rose-300">
            <span className="font-bold">{due.length} contact{due.length > 1 ? 's' : ''}</span> haven't been reached in over 14 days —
            {' '}{due.map(c => c.name).join(', ')}.
          </div>
        </div>
      )}

      {/* Contact Grid */}
      {filtered.length === 0 ? (
        <Card header={null}>
          <div className="text-center py-12 text-zinc-600 text-sm">
            No contacts found. Add your first relationship above.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => {
            const daysSince = Math.floor(
              (Date.now() - new Date(c.lastContact).getTime()) / 86400000
            );
            const isOverdue = daysSince > 14;
            return (
              <Card
                key={c.id}
                header={
                  <div className="flex justify-between items-center w-full">
                    <span className="text-zinc-200 font-semibold truncate pr-2">{c.name}</span>
                    <span className={`text-[9px] font-mono tracking-wider border px-2 py-0.5 rounded flex-shrink-0 ${ROLE_COLORS[c.role]}`}>
                      {c.role.toUpperCase()}
                    </span>
                  </div>
                }
              >
                <div className="flex flex-col gap-3 text-xs text-zinc-400">
                  {/* Score */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span>Interaction Score</span>
                      <span className="font-bold text-zinc-200">{c.interactionScore}/100</span>
                    </div>
                    <ScoreDots score={c.interactionScore} />
                    <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-600 to-pink-400 h-full rounded-full transition-all"
                        style={{ width: `${c.interactionScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Contact */}
                  <div className={`flex justify-between items-center border-t border-zinc-850 pt-3 ${isOverdue ? 'text-rose-400' : ''}`}>
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {isOverdue ? `${daysSince}d overdue` : `Last contact`}
                    </span>
                    <span className="font-mono text-zinc-300">{c.lastContact}</span>
                  </div>

                  {/* Notes */}
                  {c.notes && (
                    <p className="text-[10px] text-zinc-500 border-t border-zinc-850 pt-2 leading-relaxed line-clamp-2">
                      {c.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-zinc-850 pt-3">
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-center rounded-lg flex items-center justify-center gap-1 text-[10px] font-semibold text-zinc-300"
                      >
                        <Mail className="w-3.5 h-3.5 text-pink-500" /> Email
                      </a>
                    )}
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-center rounded-lg flex items-center justify-center gap-1 text-[10px] font-semibold text-zinc-300"
                      >
                        <Phone className="w-3.5 h-3.5 text-pink-500" /> Call
                      </a>
                    )}
                    <button
                      onClick={() => c.id && deleteContact(c.id)}
                      className="p-2 bg-zinc-950 hover:bg-rose-900/20 border border-zinc-800 hover:border-rose-800 rounded-lg text-zinc-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
