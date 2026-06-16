'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { Factory, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ManufacturingOS() {
  const batches = useLiveQuery(() => db.batchRecords.toArray()) || [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(0,180,216,0.1)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-[#16A34A]" />
            <span className="font-mono text-sm text-[#16A34A] tracking-widest uppercase">Production</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Manufacturing OS
          </h1>
        </div>
        <button className="btn-primary !bg-[#16A34A] hover:!bg-[#22C55E]">
          <Plus className="w-4 h-4" /> Schedule Batch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elevated !p-0">
          <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-zinc-900/50">
            <h2 className="font-bold text-white">Production Schedule</h2>
          </div>
          <div className="p-2 space-y-2">
            {batches.map(batch => (
              <div key={batch.id} className="p-4 border border-zinc-800 rounded-lg hover:border-[#16A34A] transition-colors flex justify-between items-center bg-[rgba(15,23,42,0.4)]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500">{batch.batchId}</span>
                    <span className="font-bold text-white">{batch.productName}</span>
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">Target: {batch.targetWeight}kg • Start: {new Date(batch.startDate).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  {batch.status === 'Completed' && <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1"/> {batch.status}</span>}
                  {batch.status === 'In Progress' && <span className="badge badge-warning text-[#F59E0B]"><Clock className="w-3 h-3 mr-1"/> {batch.status}</span>}
                  {batch.status === 'Planned' && <span className="badge bg-zinc-800 border-zinc-700 text-zinc-300">{batch.status}</span>}
                  {batch.status === 'Failed' && <span className="badge badge-error"><AlertTriangle className="w-3 h-3 mr-1"/> {batch.status}</span>}
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <div className="p-10 text-center text-zinc-500">No batches scheduled.</div>
            )}
          </div>
        </div>

        <div className="card h-fit">
          <h3 className="font-bold text-white border-b border-zinc-800 pb-3 mb-4">QA Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">First Time Pass Rate</span>
                <span className="text-[#16A34A] font-bold">98.5%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5"><div className="bg-[#16A34A] h-1.5 rounded-full" style={{width: '98.5%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Yield Efficiency</span>
                <span className="text-[#00B4D8] font-bold">94.2%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5"><div className="bg-[#00B4D8] h-1.5 rounded-full" style={{width: '94.2%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
