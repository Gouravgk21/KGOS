'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { Users, Search, Phone, Mail, Building2, Plus } from 'lucide-react';
import { Linkedin } from '@/components/icons/Linkedin';

export default function CRMContacts() {
  const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#8B5CF6]" />
            <span className="font-mono text-sm text-[#8B5CF6] tracking-widest uppercase">Network</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Contacts Database
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6] text-sm transition-colors"
            />
          </div>
          <button className="btn-primary !bg-[#8B5CF6] hover:!bg-[#A78BFA]">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      <div className="card-elevated !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-500 uppercase font-mono bg-zinc-900/50 border-b border-[rgba(255,255,255,0.05)]">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company/Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Interaction Score</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(contact => (
                <tr key={contact.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-zinc-800/30 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center font-mono font-bold">
                      {contact.name.charAt(0)}
                    </div>
                    {contact.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-zinc-800 border border-zinc-700">{contact.role}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    <div className="flex flex-col gap-1">
                      {contact.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-zinc-500"/> {contact.email}</div>}
                      {contact.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-zinc-500"/> {contact.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-zinc-800 rounded-full h-1.5"><div className="bg-[#8B5CF6] h-1.5 rounded-full" style={{width: `${Math.min(100, contact.interactionScore * 10)}%`}}></div></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 transition-colors"><Linkedin className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 transition-colors"><Mail className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
