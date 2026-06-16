'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { resetAndReseed } from '@/db/seed';
import { db } from '@/db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Settings, Key, Database, RefreshCw, CheckCircle2, Shield, 
  Cpu, User, FileText, CloudLightning, Save, Trash2, Sliders,
  Zap, Bot, Plus, Trash, Play, AlertCircle, Sparkles, CheckCircle
} from 'lucide-react';

const BOARD_PERSONAS = [
  { name: 'AI CEO', role: 'Strategic planning, decade goals & reviews', rules: 'Filter out low-ROI tasks. High-level delegation focus.' },
  { name: 'AI COO', role: 'Daily execution schedules & energy level monitoring', rules: 'Flag tasks if health or sleep logs decay.' },
  { name: 'AI Sales Director', role: 'Lead generation outreach & pipeline management', rules: 'Generate hyper-technical value-focused B2B emails.' },
  { name: 'AI Research Director', role: 'Seaweed hydrocolloid publications & PhD tracking', rules: 'Monitor rheology academic papers and gaps.' },
  { name: 'AI Exam Coach', role: 'FSSAI/ICAR exam preparation checklists & schedules', rules: 'Maintain 45m daily study routine alerts.' }
];

const PRE_BUILT_TEMPLATES = [
  {
    name: 'High-Value Lead Alert',
    trigger: 'Lead Status Changed',
    conditions: JSON.stringify([{ field: 'opportunityValue', operator: 'greaterThan', value: '500000' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'Immediate follow-up required for high-value B2B lead!' }, { type: 'triggerN8N', url: 'https://n8n.kgos.local/webhook/lead-sync' }]),
    description: 'Triggered when a lead value exceeds ₹5.00 L. Fires a notification and triggers the n8n CRM sync webhook.'
  },
  {
    name: 'Burnout Prevention Monitor',
    trigger: 'Health Log Updated',
    conditions: JSON.stringify([{ field: 'sleepHours', operator: 'lessThan', value: '6.0' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'Sleep logged below 6 hours. High-cognitive tasks auto-deferred.' }, { type: 'updateMemory', agent: 'coo', text: 'Recommend screen wind-down.' }]),
    description: 'Fires if logged sleep hours fall below 6h. Updates AI COO memory to advise rest.'
  },
  {
    name: 'Critical Formulation Cost Threshold',
    trigger: 'Formulation Modified',
    conditions: JSON.stringify([{ field: 'costPerKg', operator: 'greaterThan', value: '350' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'Formulation raw materials cost exceeds target threshold (₹350/kg)!' }]),
    description: 'Triggers when a carrageenan blend formulation unit cost exceeds ₹350 per Kilogram.'
  },
  {
    name: 'Mock Test Review Scheduler',
    trigger: 'Mock Test Completed',
    conditions: JSON.stringify([{ field: 'accuracy', operator: 'lessThan', value: '70' }]),
    actions: JSON.stringify([{ type: 'createTask', title: 'Review weak syllabus chapters (Mock accuracy < 70%)', priority: 'HIGH' }]),
    description: 'Auto-creates a high-priority review task if mock exam simulator score falls below 70%.'
  },
  {
    name: 'DBT Grant Deadline Monitor',
    trigger: 'System Clock (Daily)',
    conditions: JSON.stringify([{ field: 'daysToDeadline', operator: 'lessThan', value: '14' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'PhD application / funding grant deadline is less than 2 weeks away!' }]),
    description: 'Sends a daily reminder if a scheduled research grant deadline falls under 14 days.'
  },
  {
    name: 'Low Yield Batch Quality Alert',
    trigger: 'Batch Record Completed',
    conditions: JSON.stringify([{ field: 'yieldPct', operator: 'lessThan', value: '85' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'Production Batch yield dropped below critical 85% target!' }]),
    description: 'Flags production batches where actual weight vs target yield is below 85%.'
  },
  {
    name: 'New Research Paper Logger',
    trigger: 'New Paper Added',
    conditions: JSON.stringify([{ field: 'citations', operator: 'greaterThan', value: '100' }]),
    actions: JSON.stringify([{ type: 'updateMemory', agent: 'research', text: 'High impact paper added. Check references.' }]),
    description: 'Fires when a paper with >100 citations is indexed in Research OS. Injects study prompt into AI Research Director.'
  },
  {
    name: 'LinkedIn Post Outline Draft',
    trigger: 'Content Piece Created',
    conditions: JSON.stringify([{ field: 'status', operator: 'equals', value: 'Idea' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'LinkedIn Hook Idea logged. AI draft generated in queue.' }]),
    description: 'Notifies when content ideas are captured, queuing background hook variations.'
  },
  {
    name: 'Guar/Carrageenan Price Spike Monitor',
    trigger: 'Ingredient Modified',
    conditions: JSON.stringify([{ field: 'costPerKg', operator: 'greaterThan', value: '600' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'Guar Gum/Carrageenan supply price spiked above limit!' }]),
    description: 'Warns the business side if hydrocolloid catalog prices spike beyond ₹600/kg.'
  },
  {
    name: 'Habit Streak Fire Alarm',
    trigger: 'Habit Streak Broken',
    conditions: JSON.stringify([{ field: 'streak', operator: 'equals', value: '0' }]),
    actions: JSON.stringify([{ type: 'notifyCOO', message: 'Daily routine/workout streak broken! Initiate streak protection protocol.' }]),
    description: 'Triggered when a logged habit streak resets. Notifies COO to trigger recovery steps.'
  }
];

interface ExecutionLog {
  id: string;
  timestamp: string;
  ruleName: string;
  status: 'Success' | 'Warning' | 'Failed';
  details: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'automations'>('system');
  
  // System Config States
  const [openAiKey, setOpenAiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  
  // UX triggers
  const [reseeding, setReseeding] = useState(false);
  const [reseedDone, setReseedDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wiped, setWiped] = useState(false);

  // Automation states
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState('Lead Status Changed');
  const [condField, setCondField] = useState('opportunityValue');
  const [condOperator, setCondOperator] = useState('greaterThan');
  const [condValue, setCondValue] = useState('');
  const [actType, setActType] = useState('notifyCOO');
  const [actMessage, setActMessage] = useState('');
  const [actWebhook, setActWebhook] = useState('');
  const [actTaskTitle, setActTaskTitle] = useState('');

  const [logs, setLogs] = useState<ExecutionLog[]>([
    { id: '1', timestamp: '2026-06-14 16:45:12', ruleName: 'High-Value Lead Alert', status: 'Success', details: 'Triggered by lead Heritage Foods (₹6.50L). Webhook fired to n8n.' },
    { id: '2', timestamp: '2026-06-14 15:30:04', ruleName: 'Burnout Prevention Monitor', status: 'Warning', details: 'Fired: Sleep (5.5h) < 6.0h limit. Updated AI COO agent memory context.' },
    { id: '3', timestamp: '2026-06-14 12:12:59', ruleName: 'Mock Test Review Scheduler', status: 'Success', details: 'Created task: "Review weak syllabus chapters (Mock accuracy < 70%)" due in 24h.' },
    { id: '4', timestamp: '2026-06-13 18:00:22', ruleName: 'Critical Formulation Cost Threshold', status: 'Failed', details: 'Triggered by blend formulation v3. Cost evaluated: ₹380/kg. Webhook timeout on Slack endpoint.' }
  ]);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOpenAiKey(localStorage.getItem('kgos_openai_api_key') || '');
      setSupabaseUrl(localStorage.getItem('kgos_supabase_url') || '');
      setSupabaseAnonKey(localStorage.getItem('kgos_supabase_anon_key') || '');
    }
  }, []);

  // Live query for active rules
  const rules = useLiveQuery(() => db.automationRules.toArray()) ?? [];

  // Seed default templates if database table is empty
  useEffect(() => {
    const seedRulesIfEmpty = async () => {
      if (rules.length === 0) {
        const count = await db.automationRules.count();
        if (count === 0) {
          const defaultRules = PRE_BUILT_TEMPLATES.slice(0, 4).map(r => ({
            name: r.name,
            trigger: r.trigger,
            conditions: r.conditions,
            actions: r.actions,
            isActive: true,
            runCount: 0,
            createdAt: new Date().toISOString()
          }));
          await db.automationRules.bulkAdd(defaultRules);
        }
      }
    };
    seedRulesIfEmpty();
  }, [rules]);

  const handleSaveAPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('kgos_openai_api_key', openAiKey.trim());
      localStorage.setItem('kgos_supabase_url', supabaseUrl.trim());
      localStorage.setItem('kgos_supabase_anon_key', supabaseAnonKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReseed = async () => {
    if (reseeding) return;
    setReseeding(true);
    setReseedDone(false);
    try {
      await resetAndReseed();
      setReseedDone(true);
      setTimeout(() => {
        setReseedDone(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Failed to reseed database:', err);
    } finally {
      setReseeding(false);
    }
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm('WARNING: This will wipe all local data tables in IndexedDB! Continue?')) return;
    try {
      await Promise.all([
        db.tasks.clear(),
        db.goals.clear(),
        db.leads.clear(),
        db.healthLogs.clear(),
        db.researchPapers.clear(),
        db.exams.clear(),
        db.knowledgeNotes.clear(),
        db.documents.clear(),
        db.dailyReviews.clear(),
        db.projects.clear(),
        db.habits.clear(),
        db.skills.clear(),
        db.products.clear(),
        db.suppliers.clear(),
        db.transactions.clear(),
        db.contacts.clear(),
        db.opportunities.clear(),
        db.timeAllocations.clear(),
        db.formulations.clear(),
        db.ingredients.clear(),
        db.batchRecords.clear(),
        db.studySessions.clear(),
        db.studyTopics.clear(),
        db.mockTests.clear(),
        db.contentPieces.clear(),
        db.knowledgeNodes ? db.knowledgeNodes.clear() : Promise.resolve(),
        db.agentMemory.clear(),
        db.notifications.clear(),
        db.healthGoals.clear(),
        db.budgetCategories.clear(),
        db.relationshipContacts.clear(),
        db.automationRules.clear()
      ]);
      setWiped(true);
      setTimeout(() => {
        setWiped(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Failed to wipe database:', err);
    }
  };

  // Rule builder actions
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const conditionsObj = [{ field: condField, operator: condOperator, value: condValue }];
    let actionsObj: any[] = [];
    if (actType === 'notifyCOO') {
      actionsObj = [{ type: 'notifyCOO', message: actMessage || 'Rule fired notification' }];
    } else if (actType === 'triggerN8N') {
      actionsObj = [{ type: 'triggerN8N', url: actWebhook || 'https://n8n.kgos.local/webhook/event' }];
    } else if (actType === 'createTask') {
      actionsObj = [{ type: 'createTask', title: actTaskTitle || 'Follow up automated task', priority: 'HIGH' }];
    } else if (actType === 'updateMemory') {
      actionsObj = [{ type: 'updateMemory', agent: 'coo', text: actMessage || 'Agent context updated' }];
    }

    const payload = {
      name: ruleName.trim(),
      trigger: ruleTrigger,
      conditions: JSON.stringify(conditionsObj),
      actions: JSON.stringify(actionsObj),
      isActive: true,
      runCount: 0,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingRuleId !== null) {
        await db.automationRules.update(editingRuleId, payload);
      } else {
        await db.automationRules.add(payload);
      }
      resetBuilder();
    } catch (err) {
      console.error('Failed to save automation rule:', err);
    }
  };

  const resetBuilder = () => {
    setShowBuilder(false);
    setEditingRuleId(null);
    setRuleName('');
    setRuleTrigger('Lead Status Changed');
    setCondField('opportunityValue');
    setCondOperator('greaterThan');
    setCondValue('');
    setActType('notifyCOO');
    setActMessage('');
    setActWebhook('');
    setActTaskTitle('');
  };

  const handleEditRule = (rule: any) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setRuleTrigger(rule.trigger);
    
    try {
      const conds = JSON.parse(rule.conditions);
      if (conds && conds[0]) {
        setCondField(conds[0].field);
        setCondOperator(conds[0].operator);
        setCondValue(conds[0].value);
      }
      const acts = JSON.parse(rule.actions);
      if (acts && acts[0]) {
        setActType(acts[0].type);
        if (acts[0].type === 'notifyCOO') {
          setActMessage(acts[0].message);
        } else if (acts[0].type === 'triggerN8N') {
          setActWebhook(acts[0].url);
        } else if (acts[0].type === 'createTask') {
          setActTaskTitle(acts[0].title);
        } else if (acts[0].type === 'updateMemory') {
          setActMessage(acts[0].text);
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    setShowBuilder(true);
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Delete this automation rule?')) return;
    await db.automationRules.delete(id);
  };

  const handleToggleRule = async (rule: any) => {
    await db.automationRules.update(rule.id, { isActive: !rule.isActive });
  };

  const handleRunRule = async (rule: any) => {
    const updatedCount = (rule.runCount || 0) + 1;
    const now = new Date().toISOString();
    await db.automationRules.update(rule.id, {
      runCount: updatedCount,
      lastRun: now
    });

    // Parse action to show details
    let actionDesc = 'Notification sent.';
    try {
      const acts = JSON.parse(rule.actions);
      if (acts[0]) {
        if (acts[0].type === 'notifyCOO') actionDesc = `Notification sent to COO: "${acts[0].message}"`;
        else if (acts[0].type === 'triggerN8N') actionDesc = `Triggered n8n webhook: ${acts[0].url}`;
        else if (acts[0].type === 'createTask') actionDesc = `Created task: "${acts[0].title}"`;
        else if (acts[0].type === 'updateMemory') actionDesc = `Updated agent memory profile: "${acts[0].text}"`;
      }
    } catch (e) {}

    const newLog: ExecutionLog = {
      id: Date.now().toString(),
      timestamp: now.replace('T', ' ').slice(0, 19),
      ruleName: rule.name,
      status: 'Success',
      details: `Manual trigger: Conditions verified. Executed: ${actionDesc}`
    };

    setLogs(prev => [newLog, ...prev.slice(0, 8)]);
  };

  const installTemplate = async (tmpl: typeof PRE_BUILT_TEMPLATES[0]) => {
    try {
      await db.automationRules.add({
        name: tmpl.name,
        trigger: tmpl.trigger,
        conditions: tmpl.conditions,
        actions: tmpl.actions,
        isActive: true,
        runCount: 0,
        createdAt: new Date().toISOString()
      });
      
      const newLog: ExecutionLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ruleName: tmpl.name,
        status: 'Success',
        details: `Installed pre-built workflow template successfully.`
      };
      setLogs(prev => [newLog, ...prev.slice(0, 8)]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <Settings className="w-6 h-6 text-[#00B4D8]" /> SYSTEM CONTROLS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Configure local API variables, database migrations, and workflow automation rules.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            System Configuration
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'automations' ? 'bg-[#006D77] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Automation Hub
          </button>
        </div>
      </div>

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile overview */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <User className="w-4 h-4 text-blue-400" /> PROFESSIONAL IDENTITY SUMMARY
              </span>
            }>
              <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-lg text-[#D4A017] border border-[#D4A017]/25 font-display">
                    KG
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">Kumar Gourav</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">Founder & Chief Operating Officer · KAFS</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="font-semibold text-zinc-300 font-display tracking-wider text-[10px]">ENGINEERING & FOOD SCIENCE</span>
                    <p className="text-[10px] text-zinc-500 mt-1">Agricultural Engineer · Food Technologist · Rheology & Hydrocolloids Specialist</p>
                  </div>
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="font-semibold text-zinc-300 font-display tracking-wider text-[10px]">BUSINESS & RESEARCH PIPELINE</span>
                    <p className="text-[10px] text-zinc-500 mt-1">B2B Sales Professional · Future PhD Candidate · AI Native Knowledge Architect</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* API Keys Configuration */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Key className="w-4 h-4 text-amber-400" /> LOCAL API KEYS & SYNC ENDPOINT
              </span>
            }>
              <form onSubmit={handleSaveAPI} className="space-y-4">
                <p className="text-[10px] text-zinc-500 leading-normal uppercase font-mono">
                  All keys are stored locally in sandbox storage for privacy. Local integrations run client-side.
                </p>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">OpenAI API Key</label>
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={openAiKey}
                      onChange={e => setOpenAiKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Supabase Endpoint URL</label>
                      <input
                        type="text"
                        placeholder="https://your-project.supabase.co"
                        value={supabaseUrl}
                        onChange={e => setSupabaseUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Supabase Anon Key</label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOi..."
                        value={supabaseAnonKey}
                        onChange={e => setSupabaseAnonKey(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saved ? 'SAVED SUCCESSFULLY!' : 'SAVE INTEGRATIONS'}
                  </button>
                </div>
              </form>
            </Card>

            {/* AI Board configurations */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Cpu className="w-4 h-4 text-purple-400" /> AI BOARD DELEGATION ROLES
              </span>
            }>
              <div className="space-y-3">
                {BOARD_PERSONAS.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-850 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white font-display tracking-wide">{p.name}</span>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">Active</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{p.role}</p>
                    <div className="text-[10px] bg-zinc-950 p-2 rounded border border-zinc-850 text-zinc-500 italic font-mono">
                      Logic: {p.rules}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Database management */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Database className="w-4 h-4 text-emerald-400" /> DATABASE CONTROLS
              </span>
            }>
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded bg-zinc-950 border border-zinc-850 space-y-2">
                  <h3 className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono text-[10px]">
                    <CloudLightning className="w-4 h-4 text-blue-400" /> INDEXEDDB LOCAL SYSTEM
                  </h3>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Database tables run locally in your browser sandbox using Dexie.js for offline-first capabilities.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleReseed}
                    disabled={reseeding}
                    className={`
                      w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border font-mono cursor-pointer
                      ${reseedDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : reseeding
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 cursor-wait animate-pulse'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                      }
                    `}
                  >
                    {reseedDone ? (
                      <><CheckCircle2 className="w-4 h-4" /> RE-SEEDED SUCCESS</>
                    ) : (
                      <><RefreshCw className={`w-4 h-4 ${reseeding ? 'animate-spin' : ''}`} /> RESET & RE-SEED DEMO DATA</>
                    )}
                  </button>

                  <button
                    onClick={handleWipeDatabase}
                    className="w-full bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all font-mono cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    WIPE LOCAL DATABASE
                  </button>
                </div>
              </div>
            </Card>

            {/* System Info */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Shield className="w-4 h-4 text-zinc-400" /> SYSTEM DIAGNOSTICS
              </span>
            }>
              <div className="space-y-3 text-[11px] text-zinc-500 leading-normal font-mono">
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span>Architecture</span>
                  <span className="text-zinc-300">Next.js 16 (App Router)</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span>Local DB</span>
                  <span className="text-zinc-300">Dexie IndexedDB v3</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span>Styling Engine</span>
                  <span className="text-zinc-300">Tailwind v4</span>
                </div>
                <div className="flex justify-between">
                  <span>Telemetry State</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main workspace */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Workflow Builder */}
            {showBuilder ? (
              <Card header={
                <div className="flex justify-between items-center">
                  <span className="text-zinc-100 font-semibold flex items-center gap-2 font-display text-sm">
                    <Plus className="w-4 h-4 text-[#00B4D8]" /> 
                    {editingRuleId !== null ? 'EDIT AUTOMATION RULE' : 'CREATE NEW AUTOMATION RULE'}
                  </span>
                  <button onClick={resetBuilder} className="text-xs text-zinc-400 hover:text-white cursor-pointer font-mono">
                    CANCEL
                  </button>
                </div>
              }>
                <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Rule Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Pipeline Slack Alert"
                      value={ruleName}
                      onChange={e => setRuleName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trigger selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Trigger Event</label>
                      <select
                        value={ruleTrigger}
                        onChange={e => {
                          setRuleTrigger(e.target.value);
                          // Auto set default field
                          if (e.target.value === 'Lead Status Changed') setCondField('opportunityValue');
                          else if (e.target.value === 'Health Log Updated') setCondField('sleepHours');
                          else if (e.target.value === 'Formulation Modified') setCondField('costPerKg');
                          else if (e.target.value === 'Mock Test Completed') setCondField('accuracy');
                          else if (e.target.value === 'New Paper Added') setCondField('citations');
                          else if (e.target.value === 'Habit Streak Broken') setCondField('streak');
                          else setCondField('value');
                        }}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                      >
                        <option value="Lead Status Changed">Lead Status Changed</option>
                        <option value="Health Log Updated">Health Log Updated</option>
                        <option value="Formulation Modified">Formulation Modified</option>
                        <option value="Mock Test Completed">Mock Test Completed</option>
                        <option value="New Paper Added">New Paper Added</option>
                        <option value="Habit Streak Broken">Habit Streak Broken</option>
                        <option value="Ingredient Modified">Ingredient Modified</option>
                        <option value="System Clock (Daily)">System Clock (Daily)</option>
                      </select>
                    </div>

                    {/* Condition details */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">If Condition Field</label>
                      <input
                        type="text"
                        value={condField}
                        onChange={e => setCondField(e.target.value)}
                        placeholder="field name"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider font-mono">Operator</label>
                      <select
                        value={condOperator}
                        onChange={e => setCondOperator(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                      >
                        <option value="greaterThan">Greater Than (&gt;)</option>
                        <option value="lessThan">Less Than (&lt;)</option>
                        <option value="equals">Equals (==)</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider font-mono">Target Threshold Value</label>
                      <input
                        type="text"
                        value={condValue}
                        onChange={e => setCondValue(e.target.value)}
                        placeholder="Value (e.g. 500000 or 6.0)"
                        required
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-zinc-850 pt-4 space-y-4">
                    <h4 className="font-semibold text-zinc-300 font-display text-[10px] tracking-wide">THEN EXECUTE ACTIONS</h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Action Type</label>
                        <select
                          value={actType}
                          onChange={e => setActType(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                        >
                          <option value="notifyCOO">Dispatch Notification Alert</option>
                          <option value="triggerN8N">Trigger n8n Webhook Endpoint</option>
                          <option value="createTask">Generate High-Priority Task</option>
                          <option value="updateMemory">Update AI Board Persona Memory</option>
                        </select>
                      </div>

                      {actType === 'notifyCOO' && (
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Notification Message</label>
                          <textarea
                            value={actMessage}
                            onChange={e => setActMessage(e.target.value)}
                            placeholder="Type alert description here..."
                            rows={3}
                            required
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                          />
                        </div>
                      )}

                      {actType === 'triggerN8N' && (
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Webhook URL</label>
                          <input
                            type="url"
                            value={actWebhook}
                            onChange={e => setActWebhook(e.target.value)}
                            placeholder="https://n8n.kgos.local/webhook/..."
                            required
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                          />
                        </div>
                      )}

                      {actType === 'createTask' && (
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Task Title</label>
                          <input
                            type="text"
                            value={actTaskTitle}
                            onChange={e => setActTaskTitle(e.target.value)}
                            placeholder="e.g. Review formulation trial failures"
                            required
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                          />
                        </div>
                      )}

                      {actType === 'updateMemory' && (
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">AI Agent Prompt Inbound Context</label>
                          <textarea
                            value={actMessage}
                            onChange={e => setActMessage(e.target.value)}
                            placeholder="e.g. User logged poor recovery. Advocate for rest."
                            rows={3}
                            required
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetBuilder}
                      className="btn-ghost text-[10px] font-mono px-3 py-1.5 rounded"
                    >
                      CLEAR
                    </button>
                    <button
                      type="submit"
                      className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                    >
                      {editingRuleId !== null ? 'UPDATE RULE' : 'ACTIVATE RULE'}
                    </button>
                  </div>
                </form>
              </Card>
            ) : null}

            {/* Active automation rules */}
            <Card header={
              <div className="flex justify-between items-center">
                <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                  <Zap className="w-4 h-4 text-[#D4A017]" /> ACTIVE AUTOMATION RULES ({rules.length})
                </span>
                {!showBuilder && (
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="bg-zinc-950 border border-zinc-850 text-[#00B4D8] hover:text-white px-3 py-1 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all hover:bg-zinc-900"
                  >
                    <Plus className="w-3.5 h-3.5" /> CREATE RULE
                  </button>
                )}
              </div>
            }>
              {rules.length === 0 ? (
                <div className="text-center py-8 text-zinc-550 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-zinc-650" />
                  <p className="text-xs uppercase font-mono tracking-wider">No active rules defined.</p>
                  <p className="text-[10px] lowercase text-zinc-600">Install templates or create a rule above.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-850">
                  {rules.map((rule: any) => {
                    let condStr = '';
                    let actStr = '';
                    try {
                      const c = JSON.parse(rule.conditions);
                      if (c && c[0]) {
                        condStr = `${c[0].field} ${c[0].operator === 'greaterThan' ? '>' : c[0].operator === 'lessThan' ? '<' : '=='} ${c[0].value}`;
                      }
                      const a = JSON.parse(rule.actions);
                      if (a && a[0]) {
                        if (a[0].type === 'notifyCOO') actStr = `Notify COO: "${a[0].message}"`;
                        else if (a[0].type === 'triggerN8N') actStr = `Trigger n8n webhook: ${a[0].url}`;
                        else if (a[0].type === 'createTask') actStr = `Create task: "${a[0].title}"`;
                        else if (a[0].type === 'updateMemory') actStr = `Update AI Board memory`;
                      }
                    } catch (e) {}

                    return (
                      <div key={rule.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                        {/* Status light */}
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${rule.isActive ? 'bg-[#00B4D8] animate-pulse' : 'bg-zinc-800'}`} />

                        {/* Details */}
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-zinc-200">{rule.name}</span>
                            <div className="flex items-center gap-2">
                              {/* Run Now Button */}
                              {rule.isActive && (
                                <button
                                  onClick={() => handleRunRule(rule)}
                                  title="Simulate Event Trigger"
                                  className="text-[#D4A017] hover:text-white p-1 hover:bg-zinc-900 rounded cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Active/Inactive Toggle */}
                              <button
                                onClick={() => handleToggleRule(rule)}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono cursor-pointer border ${
                                  rule.isActive 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                }`}
                              >
                                {rule.isActive ? 'ACTIVE' : 'MUTED'}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] text-zinc-500 pt-1 font-mono">
                            <div>
                              <span className="text-zinc-600 uppercase">ON EVENT:</span> {rule.trigger}
                            </div>
                            <div>
                              <span className="text-zinc-600 uppercase">IF COND:</span> {condStr}
                            </div>
                            <div className="col-span-2 md:col-span-1">
                              <span className="text-zinc-600 uppercase">THEN ACT:</span> <span className="text-zinc-350">{actStr}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-[9px] text-zinc-600 pt-1 font-mono">
                            <span>Runs: {rule.runCount || 0}</span>
                            {rule.lastRun && <span>Last Executed: {new Date(rule.lastRun).toLocaleString()}</span>}
                            <div className="ml-auto flex items-center gap-2">
                              <button onClick={() => handleEditRule(rule)} className="text-blue-400 hover:text-white cursor-pointer">Edit</button>
                              <span>·</span>
                              <button onClick={() => handleDeleteRule(rule.id)} className="text-rose-400 hover:text-white cursor-pointer">Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Template Gallery */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> PRE-BUILT AUTOMATION TEMPLATES
              </span>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRE_BUILT_TEMPLATES.map((tmpl, index) => {
                  const alreadyInstalled = rules.some(r => r.name === tmpl.name);
                  return (
                    <div key={index} className="p-3 border border-zinc-850 rounded-lg bg-zinc-900/20 flex flex-col justify-between gap-3 text-xs">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-zinc-200">{tmpl.name}</span>
                          <span className="text-[8px] font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-500">{tmpl.trigger}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">{tmpl.description}</p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => installTemplate(tmpl)}
                          disabled={alreadyInstalled}
                          className={`px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border ${
                            alreadyInstalled
                              ? 'bg-zinc-900/60 border-zinc-850 text-zinc-650 cursor-not-allowed'
                              : 'bg-purple-900/20 hover:bg-purple-900/40 border-purple-500/30 text-purple-300'
                          }`}
                        >
                          {alreadyInstalled ? 'INSTALLED' : 'DEPLOY'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right column logs */}
          <div className="space-y-6">
            {/* Live Webhook Monitoring */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <CloudLightning className="w-4 h-4 text-emerald-400" /> LIVE TELEMETRY LOGS
              </span>
            }>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between border-b border-zinc-900 pb-1.5 text-zinc-500">
                  <span>ENDPOINT</span>
                  <span>LATENCY</span>
                  <span>STATUS</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300 border-b border-zinc-900 pb-1.5">
                  <span className="truncate max-w-[150px]">n8n-lead-webhook</span>
                  <span>45ms</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300 border-b border-zinc-900 pb-1.5">
                  <span className="truncate max-w-[150px]">slack-alert-stream</span>
                  <span>110ms</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="truncate max-w-[150px]">patent-scraper-cron</span>
                  <span>--</span>
                  <span className="text-zinc-500">STANDBY</span>
                </div>
              </div>
            </Card>

            {/* Recent Execution Logs */}
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <FileText className="w-4 h-4 text-[#D4A017]" /> EXECUTION AUDIT LOG
              </span>
            }>
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="p-2.5 rounded bg-zinc-950 border border-zinc-850 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-zinc-400 font-bold">{log.ruleName}</span>
                      <span className={
                        log.status === 'Success' ? 'text-emerald-400 font-bold' :
                        log.status === 'Warning' ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'
                      }>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal font-mono">{log.details}</p>
                    <div className="text-[8px] text-zinc-600 text-right font-mono">{log.timestamp}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
