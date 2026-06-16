'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  FlaskConical, ChevronLeft, CheckCircle, Clock, Archive, Beaker,
  TrendingUp, Tag, FileText, Edit3, Save, X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/formatters';

interface IngredientItem {
  name: string;
  pct: number;
  cost: number;
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'var(--color-success)',
  Draft: 'var(--color-warning)',
  Archived: 'var(--text-muted)',
};

export default function FormulationDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = parseInt(params.id, 10);

  const formulation = useLiveQuery(
    () => db.formulations.get(id),
    [id]
  );

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  if (formulation === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-[var(--color-turquoise)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!formulation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Beaker className="w-12 h-12 text-[var(--text-muted)]" />
        <h2 className="text-xl font-bold text-[var(--text-secondary)]">Formulation not found</h2>
        <Link href="/formulation-lab" className="btn-primary flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Lab
        </Link>
      </div>
    );
  }

  const ingredients: IngredientItem[] = (() => {
    try { return JSON.parse(formulation.ingredientsList) as IngredientItem[]; }
    catch { return []; }
  })();

  const results = (() => {
    if (!formulation.results) return null;
    try { return JSON.parse(formulation.results) as Record<string, string | number>; }
    catch { return null; }
  })();

  const totalPct = ingredients.reduce((s, i) => s + i.pct, 0);
  const calculatedCost = ingredients.reduce((s, i) => s + i.pct * i.cost, 0);

  const handleStatusChange = async (newStatus: 'Draft' | 'Active' | 'Archived') => {
    await db.formulations.update(id, { status: newStatus, updatedAt: new Date().toISOString() });
  };

  const handleSaveNotes = async () => {
    await db.formulations.update(id, {
      processingNotes: notesValue,
      updatedAt: new Date().toISOString(),
    });
    setEditingNotes(false);
  };

  const StatusIcon = formulation.status === 'Active'
    ? CheckCircle : formulation.status === 'Draft' ? Clock : Archive;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-mono">
        <Link href="/formulation-lab" className="hover:text-[var(--color-turquoise)] transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Formulation Lab
        </Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)]">{formulation.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${STATUS_COLORS[formulation.status]}20` }}>
            <FlaskConical className="w-6 h-6" style={{ color: STATUS_COLORS[formulation.status] }} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusIcon className="w-4 h-4" style={{ color: STATUS_COLORS[formulation.status] }} />
              <span className="text-xs font-mono uppercase tracking-widest"
                style={{ color: STATUS_COLORS[formulation.status] }}>
                {formulation.status}
              </span>
              <span className="text-[var(--text-muted)] text-xs font-mono">· v{formulation.version}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              {formulation.name}
            </h1>
            {formulation.description && (
              <p className="text-[var(--text-muted)] mt-1.5 font-mono text-sm max-w-xl">
                {formulation.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex gap-2 flex-wrap">
          {(['Draft', 'Active', 'Archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                formulation.status === s
                  ? 'text-white shadow-sm'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                background: formulation.status === s
                  ? STATUS_COLORS[s]
                  : 'rgba(255,255,255,0.05)',
                color: formulation.status === s ? 'white' : 'var(--text-muted)',
                border: `1px solid ${STATUS_COLORS[s]}40`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Target Application', value: formulation.targetApplication, color: 'var(--color-turquoise)' },
          { label: 'Est. Cost / Kg', value: formatCurrency(calculatedCost || formulation.costPerKg), color: 'var(--color-gold)' },
          { label: 'Total Load', value: `${(totalPct * 100).toFixed(3)}%`, color: 'var(--color-teal)' },
          { label: 'Last Updated', value: new Date(formulation.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), color: 'var(--text-secondary)' },
        ].map((item) => (
          <div key={item.label} className="metric-card !p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">{item.label}</div>
            <div className="font-bold text-base" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Ingredient Breakdown */}
        <div className="lg:col-span-3 card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-[var(--color-turquoise)]" />
            <h2 className="font-bold text-[var(--text-primary)]">Ingredient Breakdown</h2>
          </div>

          {ingredients.length > 0 ? (
            <div className="flex flex-col gap-2">
              {ingredients.map((ing, idx) => {
                const barWidth = totalPct > 0 ? (ing.pct / totalPct) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-[var(--radius-sm)] bg-[rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{ing.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {(ing.pct * 100).toFixed(3)}%
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--color-gold)]">
                          {formatCurrency(ing.cost)}/kg
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${barWidth}%`,
                          background: `linear-gradient(90deg, var(--color-teal), var(--color-turquoise))`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">
                      Cost contribution: {formatCurrency(ing.pct * ing.cost)}/kg final product
                    </div>
                  </div>
                );
              })}

              {/* Cost Summary */}
              <div className="mt-2 p-3 rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--color-gold-muted)] flex justify-between items-center">
                <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Calculated Cost / Kg</span>
                <span className="text-lg font-bold font-display text-[var(--color-gold)]">
                  {formatCurrency(calculatedCost)}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Beaker className="empty-icon" />
              <p>No ingredients defined yet</p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Test Results */}
          {results && (
            <div className="card flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                <h2 className="font-bold text-[var(--text-primary)] text-sm">Lab Results</h2>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(results).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                    <span className="text-xs font-mono text-[var(--text-muted)] capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Notes */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-gold)]" />
                <h2 className="font-bold text-[var(--text-primary)] text-sm">Processing Notes</h2>
              </div>
              {!editingNotes ? (
                <button
                  onClick={() => { setNotesValue(formulation.processingNotes || ''); setEditingNotes(true); }}
                  className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={handleSaveNotes} className="text-[var(--color-success)] hover:opacity-80">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingNotes(false)} className="text-[var(--text-muted)] hover:opacity-80">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editingNotes ? (
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={6}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3 text-sm text-[var(--text-primary)] font-mono resize-none focus:outline-none focus:border-[var(--color-turquoise)] transition-colors"
                placeholder="Add processing notes..."
              />
            ) : (
              <p className="text-sm font-mono text-[var(--text-muted)] leading-relaxed">
                {formulation.processingNotes || 'No processing notes added yet.'}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="card flex flex-col gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)] uppercase tracking-wider">Meta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Created</span>
              <span className="text-[var(--text-secondary)]">
                {new Date(formulation.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Version</span>
              <span className="text-[var(--color-turquoise)] font-bold">v{formulation.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Ingredients</span>
              <span className="text-[var(--text-secondary)]">{ingredients.length} components</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
