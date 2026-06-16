'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Supplier } from '@/db/database';
import { useSupplierStore } from '@/store/useSupplierStore';
import Card from '@/components/ui/Card';
import { 
  Truck, Search, Plus, Trash2, User, Phone, Mail, 
  MapPin, Globe, ExternalLink, Calendar, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function SuppliersPage() {
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) ?? [];
  const { addSupplier, deleteSupplier } = useSupplierStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const term = searchQuery.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(term);
      const matchesContact = (s.contactPerson ?? '').toLowerCase().includes(term);
      const matchesEmail = (s.email ?? '').toLowerCase().includes(term);
      return matchesName || matchesContact || matchesEmail;
    });
  }, [suppliers, searchQuery]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      await addSupplier({
        name: formName.trim(),
        contactPerson: formContact.trim() || undefined,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined
      });
      // Reset form
      setFormName('');
      setFormContact('');
      setFormPhone('');
      setFormEmail('');
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to add supplier:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this supplier?')) return;
    try {
      await deleteSupplier(id);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <Link href="/business" className="hover:text-zinc-300">KAFS ERP</Link>
            <span>/</span>
            <span className="text-zinc-400">Suppliers</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 mt-1">
            <Truck className="w-6 h-6 text-blue-500" /> Sourcing & Suppliers
          </h1>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Add Supplier Form Overlay */}
      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Log Supplier Profile</span>}>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Seaweed Solutions Ltd"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formContact}
                onChange={e => setFormContact(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="e.g. contact@domain.com"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Add Partner
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search suppliers by name or contact..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors placeholder-zinc-600"
        />
      </div>

      {/* Grid view of Suppliers */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
          <Truck className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">No active suppliers found</p>
          <p className="text-xs text-zinc-650 mt-1">Reset your query or log a new supplier partner profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map(sup => (
            <div 
              key={sup.id}
              className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/40 flex flex-col justify-between hover:bg-zinc-900/40 transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">ID: {sup.id}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 leading-snug">{sup.name}</h3>
                  {sup.contactPerson && (
                    <p className="text-[11px] text-zinc-450 mt-1 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-zinc-500" /> {sup.contactPerson}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1 pt-2 border-t border-zinc-900/60 text-[11px] text-zinc-450">
                  {sup.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-500" />
                      <a href={`mailto:${sup.email}`} className="hover:text-blue-400 transition-colors">{sup.email}</a>
                    </div>
                  )}
                  {sup.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span className="font-mono">{sup.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-3 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(sup.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleDelete(sup.id!)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
