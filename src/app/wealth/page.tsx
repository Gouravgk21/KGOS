'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import KPICard from '@/components/ui/KPICard';
import { IndianRupee, Plus, TrendingUp, TrendingDown, ArrowUpCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT';
  category: string;
  description: string;
}

export default function WealthOSPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, date: "2026-06-12", amount: 150000, type: "INCOME", category: "Consulting", description: "FSSAI formulations advisory fee" },
    { id: 2, date: "2026-06-08", amount: 45000, type: "EXPENSE", category: "Seaweed feedstock", description: "Prototype batch shipping fees" },
    { id: 3, date: "2026-06-02", amount: 100000, type: "INVESTMENT", category: "Mutual Funds", description: "Nifty 50 Index Fund Sip" }
  ]);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'INVESTMENT'>('INCOME');
  const [category, setCategory] = useState('Consulting');
  const [desc, setDesc] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const tx: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: parseInt(amount) || 0,
      type,
      category,
      description: desc
    };
    setTransactions([tx, ...transactions]);
    setAmount('');
    setDesc('');
    setIsAddOpen(false);
  };

  const netWorth = 8240000; // Mock Net Worth
  const monthlyFlow = transactions.reduce((sum, tx) => {
    if (tx.type === 'INCOME') return sum + tx.amount;
    if (tx.type === 'EXPENSE') return sum - tx.amount;
    return sum;
  }, 0);

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-500" />
            Wealth OS
          </h1>
          <p className="text-sm text-zinc-400">Manage business consulting revenues, manufacturing investments, and track compounding net worth indexes.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Transaction
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard 
          label="Strategic Net Worth" 
          value={formatCurrency(netWorth)}
          trend="positive"
          trendValue="Compounding 12% YoY"
          icon={ArrowUpCircle}
          color="#10b981"
          colorDim="rgba(16, 185, 129, 0.15)"
        />
        <KPICard 
          label="Monthly Cash Flow" 
          value={formatCurrency(monthlyFlow)}
          trend={monthlyFlow >= 0 ? 'positive' : 'negative'}
          trendValue="Net operations surplus"
          icon={TrendingUp}
          color="#3b82f6"
          colorDim="rgba(59, 130, 246, 0.15)"
        />
        <KPICard 
          label="Total Strategic Investments" 
          value={formatCurrency(2450000)}
          trend="positive"
          trendValue="Equity & Blending Plant CapEx"
          icon={IndianRupee}
          color="#f59e0b"
          colorDim="rgba(245, 158, 11, 0.15)"
        />
      </div>

      {isAddOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">Log Financial Transaction</span>}>
          <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Transaction Amount (INR)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. 50000"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as any)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="INCOME">Income / Revenue</option>
                  <option value="EXPENSE">Expense / Cost</option>
                  <option value="INVESTMENT">CapEx / Investment</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Formulations Consulting, Equipment"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Brief Description</label>
                <input 
                  type="text" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Client X sample advisory retainer"
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
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Commit Transaction
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Transactions Ledger */}
      <Card header={<span className="text-zinc-200 font-semibold">Transactions Ledger</span>}>
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-3.5 border border-zinc-800 bg-zinc-950/40 rounded-xl flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' :
                  tx.type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {tx.type === 'INCOME' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-semibold text-zinc-200">{tx.description}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{tx.category} • {tx.date}</div>
                </div>
              </div>
              <div className={`font-bold font-mono text-sm ${
                tx.type === 'INCOME' ? 'text-emerald-400' :
                tx.type === 'EXPENSE' ? 'text-rose-400' :
                'text-blue-450'
              }`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
