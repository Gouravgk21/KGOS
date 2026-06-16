'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Transaction } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  IndianRupee, Plus, FileText, Trash2, Edit2, TrendingUp, TrendingDown,
  Upload, Search, Filter, Sparkles, CheckCircle2, ChevronRight, BarChart2
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const CATEGORIES = [
  'Consulting', 'CapEx Lab', 'Suppliers', 'Mock Test Fees', 
  'Subscribers Inflow', 'Server Hosting', 'Travel', 'General Expense'
];

export default function TransactionsLedgerPage() {
  const transactions = useLiveQuery(() => 
    db.transactions.orderBy('date').reverse().toArray()
  ) || [];

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Add transaction states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<Transaction['type']>('INCOME');
  const [txCategory, setTxCategory] = useState('Consulting');
  const [txDesc, setTxDesc] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Bulk CSV import states
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');

  // AI auto-categorization simulation state
  const [aiReport, setAiReport] = useState('');

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0 || !txDesc.trim()) return;

    const txData = {
      date: txDate,
      amount: amt,
      type: txType,
      category: txCategory,
      description: txDesc,
      createdAt: new Date().toISOString()
    };

    if (editId !== null) {
      await db.transactions.update(editId, txData);
      setEditId(null);
    } else {
      await db.transactions.add(txData);
    }

    setTxAmount('');
    setTxDesc('');
    setTxCategory('Consulting');
    setTxType('INCOME');
    setTxDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(false);
  };

  const handleEdit = (t: Transaction) => {
    setEditId(t.id!);
    setTxAmount(t.amount.toString());
    setTxType(t.type);
    setTxCategory(t.category);
    setTxDesc(t.description);
    setTxDate(t.date);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Remove this transaction from ledger?')) {
      await db.transactions.delete(id);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkCsvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    for (const line of lines) {
      // expected format: YYYY-MM-DD,amount,type,category,description
      // e.g. 2026-06-12,5000,EXPENSE,Server Hosting,Next.js Hosting CapEx
      const parts = line.split(',');
      if (parts.length >= 5) {
        const date = parts[0].trim();
        const amount = parseFloat(parts[1].trim());
        const type = parts[2].trim() as Transaction['type'];
        const category = parts[3].trim();
        const description = parts[4].trim();

        if (!isNaN(amount) && ['INCOME', 'EXPENSE', 'INVESTMENT'].includes(type)) {
          await db.transactions.add({
            date,
            amount,
            type,
            category,
            description,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    setBulkCsvText('');
    setIsBulkOpen(false);
  };

  // Simulated AI Categorizer
  const handleAICategorize = () => {
    if (transactions.length === 0) {
      alert('Ledger is empty. Log some transactions first.');
      return;
    }
    setAiReport(
      `AI FINANCIAL CLASSIFICATION (SIMULATED):\n\nProcessed ${transactions.length} ledger transactions:\n• Detected "Consulting" inbound invoices (accuracy 98%)\n• Reclassified equipment purchase drafts to "CapEx Lab" (accuracy 94%)\n• Realigned monthly server subscriptions to "Server Hosting" (accuracy 99%)\n\nSystem recommendation:\n• 12% of total outflow is logged under misc categories. Try assigning tags to reduce auditing overhead.`
    );
  };

  // Filter lists
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-mono mb-1">
            <a href="/wealth" className="hover:underline">Wealth OS</a>
            <span>/</span>
            <span>Transactions Ledger</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-[#00B4D8]" />
            LEDGER TRANSACTIONS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Full transactional audit trail. Manage consulting invoices, chemical purchase expenses, and import banking reports.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="px-4 py-2 border border-slate-800 bg-[#0F172A] hover:bg-[#1A2332] text-xs rounded-lg font-semibold flex items-center gap-2 cursor-pointer text-slate-300"
          >
            <Upload className="w-4 h-4" /> Import CSV Report
          </button>
          
          <button
            onClick={() => { setEditId(null); setIsModalOpen(true); }}
            className="btn-primary text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Transaction
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters & AI Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card header={<span className="text-xs font-mono tracking-widest text-[#D4A017] uppercase">Filter Ledger</span>}>
            <div className="flex flex-col gap-4">
              
              {/* Search text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Description Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search ledger..."
                    className="w-full bg-[#0B1220] border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs outline-none text-slate-200 focus:border-slate-700"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Transaction Type</label>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                >
                  <option value="All">All Types</option>
                  <option value="INCOME">Income / Revenue</option>
                  <option value="EXPENSE">Expense / Cost</option>
                  <option value="INVESTMENT">Investment / CapEx</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Category</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

            </div>
          </Card>

          {/* AI Auditing panel */}
          <Card header={
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00B4D8]" /> AI Audit Helper
            </span>
          }>
            <div className="flex flex-col gap-3.5 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Scan transaction categories, classify CAPEX items, and suggest expense optimization rules.
              </p>
              
              <button
                onClick={handleAICategorize}
                className="w-full bg-[#0F172A] border border-slate-800 hover:bg-slate-800 py-2 rounded-lg font-mono text-[10px] text-slate-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Trigger AI Audit
              </button>

              {aiReport && (
                <div className="bg-[#1A2332]/50 border border-[#00B4D8]/20 p-3.5 rounded-lg text-[#00B4D8] font-mono whitespace-pre-line leading-relaxed relative animate-fade-in">
                  <button 
                    onClick={() => setAiReport('')}
                    className="absolute top-2 right-3 text-slate-500 hover:text-slate-350"
                  >
                    ✕
                  </button>
                  {aiReport}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Ledger Table (3/4 width) */}
        <div className="lg:col-span-3">
          <Card header={<span className="text-sm font-semibold text-slate-200">Transactions Ledger Journal</span>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Category / Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Amount (INR)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-850 hover:bg-slate-900/40">
                      <td className="py-3.5 px-3 text-slate-400 font-mono">{tx.date}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-200 block">{tx.description}</span>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{tx.category}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`font-mono font-bold text-sm ${
                          tx.type === 'INCOME' ? 'text-emerald-400' :
                          tx.type === 'EXPENSE' ? 'text-rose-400' :
                          'text-blue-400'
                        }`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="text-[#00B4D8] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id!)}
                            className="text-rose-450 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No transactions registered matching the criteria filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

      {/* LOG TRANSACTION INPUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {editId !== null ? 'Modify Ledger Transaction' : 'Log New Ledger Transaction'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕ Close</button>
            </div>

            <form onSubmit={handleSaveTransaction} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Type</label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as any)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-350 outline-none"
                  >
                    <option value="INCOME">Income / Revenue</option>
                    <option value="EXPENSE">Expense / Outflow</option>
                    <option value="INVESTMENT">Investment / CapEx</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Category</label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-350 outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Sample supply transaction"
                  value={txDesc}
                  onChange={e => setTxDesc(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-slate-700"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT DIALOG */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">Import CSV Financial Report</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleBulkImport} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Paste CSV (date,amount,type,category,desc)</label>
                <textarea
                  value={bulkCsvText}
                  onChange={e => setBulkCsvText(e.target.value)}
                  rows={6}
                  placeholder="2026-06-12,5000,EXPENSE,Server Hosting,Next.js Host&#10;2026-06-13,45000,INCOME,Consulting,Formulations Advisory"
                  className="bg-[#0B1220] border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 outline-none focus:border-slate-700"
                  required
                />
                <p className="text-[10px] text-slate-500 italic">
                  Note: Values must be comma-separated, one record per line.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsBulkOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Import Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
