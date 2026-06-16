'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type BudgetCategory } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  IndianRupee, Plus, Target, Trash2, Edit2, TrendingUp, TrendingDown,
  Sparkles, CheckCircle2, ChevronRight, BarChart2, DollarSign, Wallet
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DEFAULT_CATEGORIES = [
  'CapEx Lab', 'Suppliers', 'Server Hosting', 'Travel', 'General Expense'
];

export default function BudgetPlannerPage() {
  const budgets = useLiveQuery(() => db.budgetCategories.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const [activeMonth, setActiveMonth] = useState('2026-06');
  
  // Add budget category form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('CapEx Lab');
  const [newCatLimit, setNewCatLimit] = useState('');

  // Auto seed budget categories if empty
  React.useEffect(() => {
    const seedBudgets = async () => {
      const count = await db.budgetCategories.count();
      if (count === 0) {
        await db.budgetCategories.add({ name: 'CapEx Lab', monthlyLimit: 150000, spent: 0, month: '2026-06', createdAt: new Date().toISOString() });
        await db.budgetCategories.add({ name: 'Suppliers', monthlyLimit: 200000, spent: 0, month: '2026-06', createdAt: new Date().toISOString() });
        await db.budgetCategories.add({ name: 'Server Hosting', monthlyLimit: 10000, spent: 0, month: '2026-06', createdAt: new Date().toISOString() });
        await db.budgetCategories.add({ name: 'Travel', monthlyLimit: 25000, spent: 0, month: '2026-06', createdAt: new Date().toISOString() });
        await db.budgetCategories.add({ name: 'General Expense', monthlyLimit: 30000, spent: 0, month: '2026-06', createdAt: new Date().toISOString() });
      }
    };
    seedBudgets();
  }, []);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitVal = parseFloat(newCatLimit);
    if (isNaN(limitVal) || limitVal <= 0) return;

    // Check if category already exists for this month
    const existing = budgets.find(b => b.name === newCatName && b.month === activeMonth);
    if (existing) {
      await db.budgetCategories.update(existing.id!, { monthlyLimit: limitVal });
    } else {
      await db.budgetCategories.add({
        name: newCatName,
        monthlyLimit: limitVal,
        spent: 0,
        month: activeMonth,
        createdAt: new Date().toISOString()
      });
    }

    setNewCatLimit('');
    setIsModalOpen(false);
  };

  const handleDeleteBudget = async (id: number) => {
    if (confirm('Delete this budget limit?')) {
      await db.budgetCategories.delete(id);
    }
  };

  // Compute actual spent per category from transactions ledger for active month
  const budgetVarianceData = useMemo(() => {
    // Filter transactions for activeMonth that are EXPENSE or INVESTMENT (outflows)
    const monthTx = transactions.filter(t => t.date.startsWith(activeMonth) && (t.type === 'EXPENSE' || t.type === 'INVESTMENT'));

    // Filter budgets for activeMonth
    const monthBudgets = budgets.filter(b => b.month === activeMonth);

    return monthBudgets.map(b => {
      // Tally actual spent in this category
      const actualSpent = monthTx
        .filter(t => t.category.toLowerCase() === b.name.toLowerCase())
        .reduce((sum, t) => sum + t.amount, 0);

      const variance = b.monthlyLimit - actualSpent;
      const status = variance >= 0 ? 'UNDER' : 'OVER';
      const pct = b.monthlyLimit > 0 ? Math.round((actualSpent / b.monthlyLimit) * 100) : 0;

      return {
        id: b.id!,
        name: b.name,
        limit: b.monthlyLimit,
        actual: actualSpent,
        variance,
        status,
        pct
      };
    });
  }, [budgets, transactions, activeMonth]);

  // Aggregate stats
  const totalBudgeted = budgetVarianceData.reduce((sum, b) => sum + b.limit, 0);
  const totalActual = budgetVarianceData.reduce((sum, b) => sum + b.actual, 0);
  const totalVariance = totalBudgeted - totalActual;

  // Recharts variance data formatting
  const chartData = budgetVarianceData.map(b => ({
    name: b.name,
    Limit: b.limit,
    Actual: b.actual
  }));

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00B4D8] text-xs font-mono mb-1">
            <a href="/wealth" className="hover:underline">Wealth OS</a>
            <span>/</span>
            <span>Budget Planner</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#00B4D8]" />
            BUDGET & VARIANCE
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze monthly category limits, review variance spreadsheets, and track savings targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          <input
            type="month"
            value={activeMonth}
            onChange={e => setActiveMonth(e.target.value)}
            className="py-1.5 px-3 bg-[#0F172A] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700 font-mono"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" /> Set Limit
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0F172A] border border-slate-850 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-[#006D77]/20 text-[#00B4D8]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Total Budgeted</span>
            <span className="text-2xl font-bold font-mono text-slate-100">{formatCurrency(totalBudgeted)}</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-850 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Actual Outflow</span>
            <span className="text-2xl font-bold font-mono text-slate-100">{formatCurrency(totalActual)}</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-850 p-4 rounded-xl flex items-center gap-4">
          <div className={`p-3 rounded-lg ${totalVariance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Remaining Surplus</span>
            <span className={`text-2xl font-bold font-mono ${totalVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(totalVariance)}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Comparison & Variance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Comparison Bar Chart (2/3 width) */}
        <div className="lg:col-span-2">
          <Card header={<span className="text-sm font-semibold text-slate-200">Budget Limit vs Actual Outflow</span>}>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Limit" fill="#006D77" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#00B4D8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">No active category limits set.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Savings Goals / Buckets Tracker (1/3 width) */}
        <div className="lg:col-span-1">
          <Card header={<span className="text-sm font-semibold text-slate-200">Compounding CapEx Savings Buckets</span>}>
            <div className="flex flex-col gap-4">
              
              {/* Lab equipment bucket */}
              <div className="flex flex-col gap-2 p-3 border border-slate-850 bg-[#0B1220]/60 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 font-serif">Lab Centrifuge CapEx</span>
                  <span className="text-[#00B4D8] font-mono">₹45,000 / ₹1,20,000</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div className="h-full rounded-full bg-[#00B4D8]" style={{ width: '37%' }} />
                </div>
                <span className="text-[9px] font-mono text-slate-500 text-right">37% Goal Met • Target Oct 2026</span>
              </div>

              {/* R&D formulation pilot run bucket */}
              <div className="flex flex-col gap-2 p-3 border border-slate-850 bg-[#0B1220]/60 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 font-serif">Carrageenan Pilot Batch</span>
                  <span className="text-emerald-400 font-mono">₹2,00,000 / ₹2,00,000</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: '100%' }} />
                </div>
                <span className="text-[9px] font-mono text-slate-500 text-right">100% Goal Met • Fully Funded</span>
              </div>

              {/* General PhD security cushion */}
              <div className="flex flex-col gap-2 p-3 border border-slate-850 bg-[#0B1220]/60 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 font-serif">PhD Academic Contingency</span>
                  <span className="text-[#D4A017] font-mono">₹3,40,000 / ₹5,00,000</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div className="h-full rounded-full bg-[#D4A017]" style={{ width: '68%' }} />
                </div>
                <span className="text-[9px] font-mono text-slate-500 text-right">68% Goal Met • Target Jan 2027</span>
              </div>

            </div>
          </Card>
        </div>

      </div>

      {/* Variance details Spreadsheet Grid */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-sm font-semibold text-slate-200">Monthly Budget Variance Audit spreadsheet</h3>
        
        <div className="bg-[#0F172A] border border-slate-850 rounded-2xl overflow-hidden p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3">Budget Limit (A)</th>
                  <th className="py-2.5 px-3">Actual Outflow (B)</th>
                  <th className="py-2.5 px-3">Variance (A - B)</th>
                  <th className="py-2.5 px-3">Utilized %</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {budgetVarianceData.map(item => (
                  <tr key={item.id} className="border-b border-slate-850 hover:bg-slate-900/40">
                    <td className="py-3.5 px-3 font-semibold text-slate-200">{item.name}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">{formatCurrency(item.limit)}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-350">{formatCurrency(item.actual)}</td>
                    <td className={`py-3.5 px-3 font-mono font-bold ${item.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        item.pct > 100 ? 'bg-rose-500/10 text-rose-400' :
                        item.pct >= 80 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {item.pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteBudget(item.id)}
                        className="text-rose-450 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {budgetVarianceData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-mono">
                      No budget category limits established for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD CATEGORY LIMIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">Establish Category Budget Limit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Category Name</label>
                <select
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none"
                >
                  {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Monthly Limit (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={newCatLimit}
                  onChange={e => setNewCatLimit(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Establish Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
