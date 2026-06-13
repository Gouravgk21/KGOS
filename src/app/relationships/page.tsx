'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Users, Plus, Phone, Mail, Award, Calendar } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  category: string;
  organization: string;
  role: string;
  email: string;
  strength: number; // 1-5
  nextFollowUp: string;
}

export default function RelationshipsPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "Dr. Ramesh Kumar", category: "CUSTOMERS", organization: "Heritage Foods", role: "R&D Director", email: "ramesh.k@heritage.com", strength: 5, nextFollowUp: "2026-06-18" },
    { id: 2, name: "Prof. S. N. Rao", category: "MENTORS", organization: "NIFTEM", role: "Dean of Food Tech", email: "sn.rao@niftem.ac.in", strength: 4, nextFollowUp: "2026-06-25" }
  ]);

  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('CUSTOMERS');
  const [newOrg, setNewOrg] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStrength, setNewStrength] = useState('4');
  const [newFollowUp, setNewFollowUp] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const contact: Contact = {
      id: Date.now(),
      name: newName,
      category: newCat,
      organization: newOrg,
      role: newRole,
      email: newEmail,
      strength: parseInt(newStrength) || 4,
      nextFollowUp: newFollowUp || new Date(Date.now() + 7 * 24 * 65 * 1000).toISOString().split('T')[0]
    };
    setContacts([contact, ...contacts]);
    setNewName('');
    setIsAddOpen(false);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" />
            Relationship Capital
          </h1>
          <p className="text-sm text-zinc-400">Track and score vital business and research contacts, and schedule networking follow-up tasks.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Track New Contact</span>}>
          <form onSubmit={handleAddContact} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Full Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Dr. Anil Mehta"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select 
                  value={newCat} 
                  onChange={e => setNewCat(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="CUSTOMERS">Customers</option>
                  <option value="MENTORS">Mentors</option>
                  <option value="RESEARCHERS">Researchers</option>
                  <option value="FAMILY">Family</option>
                  <option value="FRIENDS">Friends</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Organization</label>
                <input 
                  type="text" 
                  value={newOrg} 
                  onChange={e => setNewOrg(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Kwality Foods"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Role</label>
                <input 
                  type="text" 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Procurement Head"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Email</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. anil@kwality.in"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Relationship Score (1-5)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5"
                  value={newStrength} 
                  onChange={e => setNewStrength(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Next Follow-Up Date</label>
                <input 
                  type="date" 
                  value={newFollowUp} 
                  onChange={e => setNewFollowUp(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white"
              >
                Add Contact
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((c) => (
          <Card key={c.id} header={
            <div className="flex justify-between items-center w-full">
              <span className="text-zinc-200 font-semibold">{c.name}</span>
              <span className="text-[9px] font-mono tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded">
                {c.category}
              </span>
            </div>
          }>
            <div className="flex flex-col gap-3 text-xs text-zinc-400">
              <div className="flex justify-between items-center text-[10px]">
                <span>Affiliation</span>
                <span className="font-semibold text-zinc-350">{c.role} at {c.organization}</span>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-zinc-850 pt-3">
                <div className="flex justify-between text-[10px]">
                  <span>Relationship Score</span>
                  <span className="font-semibold text-zinc-300">{c.strength}/5</span>
                </div>
                <div className="w-full bg-zinc-850 h-1 rounded-full overflow-hidden flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full flex-1 rounded-full ${i < c.strength ? 'bg-pink-500' : 'bg-zinc-800'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-850 pt-3">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Next Ping</span>
                <span className="font-bold font-mono text-zinc-200">{c.nextFollowUp}</span>
              </div>

              <div className="flex gap-2 border-t border-zinc-850 pt-3">
                <a href={`mailto:${c.email}`} className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-center rounded-lg flex items-center justify-center gap-1 text-[10px] font-semibold text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-pink-500" /> Email
                </a>
                <button className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-center rounded-lg flex items-center justify-center gap-1 text-[10px] font-semibold text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-pink-500" /> Call
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
