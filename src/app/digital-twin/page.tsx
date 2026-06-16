'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Brain, Sparkles, MessageSquare, Send, HelpCircle, 
  User, ShieldAlert, Zap, BookOpen, Briefcase, 
  Activity, DollarSign, Users, Award, FileText
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface QuestionAnswer {
  question: string;
  answer: string;
  category: string;
}

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'gpt' | 'history'>('gpt');
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'twin'; text: string; time: string }>>([
    { 
      sender: 'twin', 
      text: 'SYSTEM INITIALIZED. I am the digital replica of your goals, operations, and knowledge. Ask me anything about your current workload, bottlenecks, or strategies.',
      time: 'Just now' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // ── Database Queries ────────────────────────────────────────────────────────
  const tasks         = useLiveQuery(() => db.tasks.toArray()) ?? [];
  const goals         = useLiveQuery(() => db.goals.toArray()) ?? [];
  const habits        = useLiveQuery(() => db.habits.toArray()) ?? [];
  const leads         = useLiveQuery(() => db.leads.toArray()) ?? [];
  const opportunities = useLiveQuery(() => db.opportunities.toArray()) ?? [];
  const healthLogs    = useLiveQuery(() => db.healthLogs.orderBy('date').reverse().limit(7).toArray()) ?? [];
  const exams         = useLiveQuery(() => db.exams.toArray()) ?? [];
  const research      = useLiveQuery(() => db.researchPapers.toArray()) ?? [];
  const transactions  = useLiveQuery(() => db.transactions.toArray()) ?? [];

  // ── Cognitive Profile Data ──────────────────────────────────────────────────
  const profile = {
    mission: 'To construct world-class systems combining Agri-Food engineering (KAFS), advanced research, and structural self-mastery.',
    vision: 'A unified operational command where functionality emerges from interactions, scaling B2B enterprise value and academic authority.',
    values: ['Interconnection', 'Local-First Resilience', 'Scientific Pragmatism', 'Compounding Momentum'],
    strengths: ['Hydrocolloids formulation', 'B2B sales pipeline design', 'Research translation', 'Multi-domain scheduling'],
    weaknesses: ['Sleep debt accumulation', 'High-context multitasking overhead', 'Spasmodic personal brand distribution'],
    decisionStyle: 'Data-driven, low-frequency, high-conviction. Irreversible decisions (plant shortlist, publication topics) are front-loaded with literature verification.',
    learningStyle: 'Structured academic synthesis. Complex concepts are mapped into the Knowledge Graph before experimentation.'
  };

  // ── Context History Toggles ─────────────────────────────────────────────────
  const [historyCategory, setHistoryCategory] = useState<'career' | 'business' | 'research' | 'financial' | 'exams'>('business');

  // Compute active status
  const avgSleep = useMemo(() => {
    const recentLogs = healthLogs.slice(0, 7);
    return recentLogs.length ? recentLogs.reduce((s, h) => s + (h.sleep ?? h.sleepHours ?? 6), 0) / recentLogs.length : 6.2;
  }, [healthLogs]);

  const activePipelineVal = useMemo(() => {
    return leads.filter(l => ['Sample Sent', 'Trial', 'Proposal'].includes(l.status)).reduce((s, l) => s + (l.opportunityValue ?? 0), 0);
  }, [leads]);

  // ── Simulated Twin Reasoning Layer ──
  const runPresetQuery = (queryType: 'focus' | 'bottleneck' | 'ignoring' | 'roi') => {
    setIsTyping(true);
    let questionText = '';
    let responseText = '';

    const todayStr = new Date().toISOString().split('T')[0];
    
    if (queryType === 'focus') {
      questionText = 'What should I focus on?';
      
      // Determine focus area based on lowest scores/highest priorities
      const lowSleep = avgSleep < 6.8;
      const lowResearch = research.filter(r => r.status === 'In Progress').length === 0;
      
      responseText = `Based on current telemetry, your primary focus should be split between two high-leverage domains:\n\n` +
        `1. **PhD Research Writing**: Your publication drafts require active writing blocks. This is a critical path for credibility.\n` +
        `2. **KAFS Active CRM Pipelines**: Follow up with clients in Trial stages (e.g. Heritage Foods). Trial momentum decays fast if untouched for >5 days.\n\n` +
        (lowSleep ? `⚠️ *Health Warning*: Sleep is averaging ${avgSleep.toFixed(1)}h. Your focus window is constrained by cognitive debt. Prioritize rest cycles tonight.` : `✓ *Health Index*: Sleep and energy cycles are stable.`);
    } 
    else if (queryType === 'bottleneck') {
      questionText = 'What is my biggest bottleneck?';
      
      const overdueTasksCount = tasks.filter(t => t.status !== 'DONE' && t.dueDate && t.dueDate < todayStr).length;
      const waitingTasks = tasks.filter(t => t.status !== 'DONE' && t.title.toLowerCase().includes('wait'));
      
      responseText = `The primary bottleneck in your workflow is currently **Multi-context Scheduling Overhead**.\n\n` +
        `* **Task Backlog**: You have ${overdueTasksCount} overdue tasks. These are clogging the daily priority deck.\n` +
        `* **PhD Lit Review Delay**: Literature compilation is 2 weeks behind, holding up experimental design parameters.\n` +
        `* **Physical Recovery**: Sleep deficit is reducing morning high-cognitive focus windows (normally 09:00 - 12:00).\n\n` +
        `*AI Recommendation*: Clear the overdue items list by delegating or moving them to a 'Future Horizon' backlog. Protect your morning study windows.`;
    } 
    else if (queryType === 'ignoring') {
      questionText = 'What am I ignoring?';
      
      const lastPostTask = tasks.filter(t => t.category === 'Content' && t.status === 'DONE').length;
      
      responseText = `You are currently ignoring **Personal Brand Syndication**.\n\n` +
        `* **LinkedIn Outreach**: It has been 14 days since your last social post. Your brand architecture states thought leadership builds credibility. You are ignoring the LinkedIn Content Factory.\n` +
        `* **Relationship Capital**: Mentors and advisors in your directory have not been pinged in 30 days. Maintain periodic contact with academic advisors.\n\n` +
        `*Quick Win*: Generate a Carrageenan formulation article template in Content Factory and publish it today.`;
    } 
    else if (queryType === 'roi') {
      questionText = 'What generates maximum ROI?';
      
      const topOpp = [...opportunities].sort((a, b) => b.roiScore - a.roiScore)[0];
      
      responseText = `Your maximum ROI actions are categorized by operational layers:\n\n` +
        `1. **Strategic (Long-Term)**: PhD Thesis Completion. This unlocks international consulting credibility and government research grants.\n` +
        `2. **Commercial (KAFS)**: Converting active trials. A successful Carrageenan test at Heritage Foods represents a potential multi-year supply contract.\n` +
        (topOpp 
          ? `3. **Opportunity Radar**: "${topOpp.title}" (${topOpp.source}) shows an ROI score of ${topOpp.roiScore}/100 with a potential revenue impact of ${formatCurrency(topOpp.revenueImpact)}.` 
          : `3. **Opportunity Radar**: Review your research funding channels.`);
    }

    setTimeout(() => {
      setChatLog(prev => [
        ...prev, 
        { sender: 'user', text: questionText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: 'twin', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    setChatInput('');
    setIsTyping(true);

    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatLog(prev => [
      ...prev, 
      { sender: 'user', text: query, time: userMsgTime }
    ]);

    setTimeout(() => {
      // Simple local responder logic matching inputs
      let reply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('focus') || qLower.includes('what should i do')) {
        reply = `My primary directive remains focused on your academic goals (PhD completion) and active B2B formulation trials in KAFS ERP. Guard your high-cognitive mornings.`;
      } else if (qLower.includes('sleep') || qLower.includes('health') || qLower.includes('energy')) {
        const avg = healthLogs.length ? healthLogs.reduce((s, h) => s + (h.sleep ?? h.sleepHours ?? 6), 0) / healthLogs.length : 6.2;
        reply = `Your health index is constrained. Sleep average is ${avg.toFixed(1)}h. Burnout risks are elevated. Plan an early wind-down slot.`;
      } else if (qLower.includes('lead') || qLower.includes('business') || qLower.includes('kafs') || qLower.includes('sales')) {
        reply = `Active KAFS CRM pipeline is tracked in SUPABASE. Top recommendation: Focus on Heritage Foods proposal stage. Keep formulation documentation synced.`;
      } else if (qLower.includes('exam') || qLower.includes('study')) {
        reply = `Exam readiness is linked to daily study hours. Solve food standard mock papers to keep revision metrics high.`;
      } else {
        reply = `Query processed. To optimize your personal operating model, focus on Carrageenan blend consistency, maintain a 7.5h sleep cycle, and follow up with active sales leads.`;
      }

      setChatLog(prev => [
        ...prev, 
        { sender: 'twin', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in text-[var(--text-primary)]">
      
      {/* Page Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-[var(--border-primary)] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="w-7 h-7 text-[var(--accent-primary)]" />
            Digital Twin & AI Persona
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
            Kumar GPT · Self-Mastery & Operations Synthesizer
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border-primary)] p-1 rounded-lg">
          {[
            { id: 'gpt', label: 'Kumar GPT', icon: MessageSquare },
            { id: 'profile', label: 'Cognitive Profile', icon: User },
            { id: 'history', label: 'Telemetry History', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                activeTab === tab.id 
                  ? 'bg-[var(--accent-primary)] text-white font-semibold' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          TAB 1: KUMAR GPT CHAT TERMINAL
          ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'gpt' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Quick Questions Board */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card header={
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> Core Twin Queries
              </span>
            }>
              <div className="flex flex-col gap-2.5">
                {[
                  { id: 'focus', text: 'What should I focus on?', desc: 'Highlights highest-leverage targets.' },
                  { id: 'bottleneck', text: 'What is my bottleneck?', desc: 'Audits blocked tasks and delays.' },
                  { id: 'ignoring', text: 'What am I ignoring?', desc: 'Finds inactive pipelines & goals.' },
                  { id: 'roi', text: 'What generates max ROI?', desc: 'Ranks options by revenue & impact.' }
                ].map(q => (
                  <button
                    key={q.id}
                    onClick={() => runPresetQuery(q.id as any)}
                    disabled={isTyping}
                    className="p-2.5 rounded border border-[var(--border-primary)] bg-[var(--bg-primary)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-card)] text-left transition-all w-full disabled:opacity-50"
                  >
                    <span className="text-xs font-semibold text-[var(--text-primary)] block font-serif">{q.text}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">{q.desc}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Status indicators */}
            <Card header={<span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] tracking-wider">Telemetry State</span>}>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[var(--border-primary)]">
                  <span className="text-[var(--text-secondary)]">Avg Sleep</span>
                  <span className="font-mono font-bold text-[var(--accent-primary)]">{avgSleep.toFixed(1)}h / 7.5h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-primary)]">
                  <span className="text-[var(--text-secondary)]">KAFS Pipeline</span>
                  <span className="font-mono font-bold text-[#3A6B6E]">{formatCurrency(activePipelineVal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-primary)]">
                  <span className="text-[var(--text-secondary)]">Active Goals</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{goals.filter(g => g.progress < 100).length} horizons</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Interactive Chat Console */}
          <div className="lg:col-span-3 flex flex-col h-[520px] rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
            {/* Console Header */}
            <div className="px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-[var(--text-secondary)]">KUMAR_GPT_V1.1 // LOCAL TELEMETRY AGENT</span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono">SUPABASE DB SYNCED</span>
            </div>

            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-sans bg-[var(--bg-primary)]/10">
              {chatLog.map((msg, idx) => {
                const isTwin = msg.sender === 'twin';
                return (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${isTwin ? 'self-start' : 'self-end flex-row-reverse'}`}>
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                      isTwin 
                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20' 
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}>
                      {isTwin ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Speech Bubble */}
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed shadow-sm ${
                      isTwin 
                        ? 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-primary)]' 
                        : 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                    }`}>
                      <div className="whitespace-pre-line font-medium">{msg.text}</div>
                      <span className={`text-[8px] font-mono block mt-1.5 text-right ${isTwin ? 'text-[var(--text-secondary)]' : 'text-zinc-200'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-3 self-start max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-xs text-[var(--text-secondary)]">
                    Thinking and querying databases...
                  </div>
                </div>
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleCustomSubmit} className="p-3 bg-[var(--bg-primary)] border-t border-[var(--border-primary)] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask your digital twin about goals, formulation trials, PhD writing..."
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg px-3.5 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] font-mono"
              />
              <button
                type="submit"
                className="px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          TAB 2: COGNITIVE PROFILE
          ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identity Core */}
          <Card header={
            <span className="text-sm font-serif font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[var(--accent-primary)]" /> Strategic Persona Core
            </span>
          }>
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">Operational Mission</span>
                <p className="font-serif text-sm font-semibold text-[var(--text-primary)] mt-1 italic leading-relaxed">
                  &ldquo;{profile.mission}&rdquo;
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block">Vision Horizon</span>
                <p className="text-[var(--text-primary)] mt-1 font-serif leading-relaxed">
                  {profile.vision}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Core Values</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.values.map((v, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[var(--border-primary)]/20 border border-[var(--border-primary)] text-[10px] font-mono text-[var(--text-primary)] font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Operational Strengths & Bottlenecks */}
          <Card header={
            <span className="text-sm font-serif font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#A24B3B]" /> Capabilities & Friction Points
            </span>
          }>
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Core Strengths</span>
                <ul className="list-disc pl-4 flex flex-col gap-1 text-[var(--text-primary)]">
                  {profile.strengths.map((s, i) => <li key={i} className="font-semibold">{s}</li>)}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#A24B3B] uppercase tracking-wider block mb-1 font-bold">Friction Points / Ignored Tracks</span>
                <ul className="list-disc pl-4 flex flex-col gap-1 text-[var(--text-secondary)]">
                  {profile.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-primary)] pt-3">
                <div>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase block">Decision Engine Style</span>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-primary)]">{profile.decisionStyle}</p>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase block">Learning Mechanism</span>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-primary)]">{profile.learningStyle}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          TAB 3: TELEMETRY HISTORY
          ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* History Selection Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest block mb-2 px-1">Twin Contexts</span>
            {[
              { id: 'career', label: 'Career OS History', icon: Briefcase },
              { id: 'business', label: 'Business (KAFS) History', icon: Award },
              { id: 'research', label: 'Research OS History', icon: BookOpen },
              { id: 'exams', label: 'Government Exams History', icon: FileText }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setHistoryCategory(cat.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-all ${
                  historyCategory === cat.id 
                    ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] font-bold' 
                    : 'border border-transparent text-[var(--text-secondary)] hover:bg-[var(--border-primary)]/10 hover:text-[var(--text-primary)]'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* History Content Viewer */}
          <div className="lg:col-span-3">
            <Card header={
              <span className="text-sm font-serif font-bold text-[var(--text-primary)] uppercase">
                {historyCategory} History & Trackers
              </span>
            }>
              <div className="text-xs leading-relaxed flex flex-col gap-4">
                
                {historyCategory === 'career' && (
                  <>
                    <p className="text-[var(--text-secondary)]">Telemetry data recording your professional positions, certification path, and Ag-tech skills matrix.</p>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-[var(--accent-primary)] font-bold block">2024 - Present // KAFS Lead Engineer</span>
                        <p className="font-semibold mt-1">Formulating hydrocolloids and Carrageenan stabilizers for B2B dairy processors.</p>
                      </div>
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-[var(--text-secondary)] block">Completed Certifications</span>
                        <p className="font-semibold mt-1">✓ FSSAI Food Compliance Officer Standard (Level A)</p>
                      </div>
                    </div>
                  </>
                )}

                {historyCategory === 'business' && (
                  <>
                    <p className="text-[var(--text-secondary)]">CRM conversion metrics and production catalog specifications representing active B2B operations.</p>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-[#3A6B6E] font-bold block">KAFS ERP Stability Index</span>
                        <p className="font-semibold mt-1">Active formulation inventory consists of Carrageenan Kapp-I and Kapp-II blends. Primary target: Milk gel strength stability.</p>
                      </div>
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-[var(--text-secondary)] block">Target B2B Segments</span>
                        <p className="font-semibold mt-1">Ice Cream Stabilizers, Chocolate Milk Emulsifiers, Processed Cheese Gelators.</p>
                      </div>
                    </div>
                  </>
                )}

                {historyCategory === 'research' && (
                  <>
                    <p className="text-[var(--text-secondary)]">Academic publication pipelines, citation trackers, and literature library synthesis records.</p>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-purple-700 font-bold block">Active Focus: Synergistic Hydrocolloid Gelation</span>
                        <p className="font-semibold mt-1">Drafting paper on Kappa-Carrageenan and Locust Bean Gum rheological synergy under high salt concentrations.</p>
                      </div>
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-[var(--text-secondary)] block">Target Journals</span>
                        <p className="font-semibold mt-1">Food Hydrocolloids, Journal of Agricultural and Food Chemistry.</p>
                      </div>
                    </div>
                  </>
                )}

                {historyCategory === 'exams' && (
                  <>
                    <p className="text-[var(--text-secondary)]">Study schedules, subject coverage metrics, and mock analysis for targeted FSSAI examinations.</p>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-orange-700 font-bold block">FSSAI Technical Officer Mock Prep</span>
                        <p className="font-semibold mt-1">Average mock score: 78%. Weak sections identified: Food Safety Act Regulations, section 22-26.</p>
                      </div>
                      <div className="p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-primary)]/40">
                        <span className="font-mono text-[10px] text-[var(--text-secondary)] block">Accumulated Study Hours</span>
                        <p className="font-semibold mt-1">74 hours logged in Exams OS. Recommended revision pace: 1.5h/day.</p>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
