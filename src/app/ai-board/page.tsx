'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db } from '@/db/database';
import { useAppStore } from '@/store/useAppStore';
import {
  Cpu, Terminal, ShieldAlert, Sparkles, Send, Bot, ChevronRight,
  Brain, TrendingUp, Users, Beaker, BookOpen, Heart, DollarSign,
  Target, Zap, Globe, Lock, FlaskConical
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  shortName: string;
  role: string;
  domain: string;
  icon: React.ElementType;
  accentColor: string;
  badgeColor: string;
  memory: string;
  inputs: string;
  rules: string;
  advice: string;
  escalation: string;
}

interface ChatMessage {
  agentId: string;
  from: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

const AGENTS: Agent[] = [
  {
    id: 'ceo',
    name: 'AI CEO — Strategic Review',
    shortName: 'CEO',
    role: 'Long-term capital allocation, 10-year vision, KAFS expansion strategy.',
    domain: 'STRATEGY',
    icon: Globe,
    accentColor: 'text-blue-500',
    badgeColor: 'bg-blue-500/10 text-blue-800 border-blue-500/20',
    memory: 'Monitoring DECADE and 5-YEAR goal horizon. Aware of KAFS ₹100Cr expansion target by 2036. PhD completion milestone critical for credibility unlocks.',
    inputs: 'Business revenue forecasts, macro food market trends, PhD milestones, brand positioning.',
    rules: 'Prioritize long-term capital compounding over short-term revenue. R&D formulation facility setup must remain on the critical path.',
    advice: 'Focus 80% of quarterly energy on Carrageenan blend formulation plant shortlisting and PhD framework completion. These are irreversible leverage points.',
    escalation: 'Escalate to board if quarterly goal completion falls below 40% when deadline is <30 days away.',
  },
  {
    id: 'coo',
    name: 'AI COO — Daily Execution',
    shortName: 'COO',
    role: 'Daily priority planning, habit auditing, energy management.',
    domain: 'OPERATIONS',
    icon: Zap,
    accentColor: 'text-amber-500',
    badgeColor: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
    memory: 'Sleep average is currently 6.2h. Habit completion rate at 78%. Morning energy window is 09:00–12:00.',
    inputs: 'Daily task completions, sleep logs, exercise logs, energy ratings.',
    rules: 'Flag burnout warning if sleep < 6h for 2 consecutive nights. Re-rank daily tasks by ROI × urgency matrix.',
    advice: 'Shift highest-cognitive tasks (formulation writing, research drafting) to 9–11 AM slot. Protect Saturday mornings as strategic review blocks.',
    escalation: 'Escalate to Risk Engine if burnout indicator rises to HIGH for 3+ consecutive days.',
  },
  {
    id: 'sales',
    name: 'AI Sales Director',
    shortName: 'Sales',
    role: 'CRM pipeline, lead conversion, B2B proposal strategy.',
    domain: 'SALES',
    icon: TrendingUp,
    accentColor: 'text-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20',
    memory: 'CRM pipeline: ₹13 Lakhs active. Heritage Foods trial is highest-conversion stage. 2 proposals due this week.',
    inputs: 'Lead stages, sample dispatch logs, follow-up cadence, proposal deadlines.',
    rules: 'Auto-flag follow-up 5 days after sample dispatch. Escalate if proposal conversion rate drops below 15%.',
    advice: 'Follow up with Dr. Ramesh Kumar at Heritage Foods today — sample feedback is due and silence beyond 5 days risks losing trial momentum.',
    escalation: 'Escalate if >3 qualified leads go cold in a 30-day window without contact.',
  },
  {
    id: 'research',
    name: 'AI Research Director',
    shortName: 'Research',
    role: 'PhD progress, paper submissions, grant scouting.',
    domain: 'RESEARCH',
    icon: Beaker,
    accentColor: 'text-violet-500',
    badgeColor: 'bg-violet-500/10 text-violet-800 border-violet-500/20',
    memory: 'PhD literature review is 2 weeks behind schedule. DBT grant window closes in 6 weeks. 1 paper in drafting stage.',
    inputs: 'Research milestones, publication pipeline, grant deadlines, advisor meetings.',
    rules: 'Minimum 4h/week dedicated research writing block. All grant opportunities must be scored before ignoring.',
    advice: 'Block out at least 2 hours tomorrow morning for PhD literature review writing. Prioritize reading the new papers on Carrageenan rheology synergies.',
    escalation: 'Escalate to CEO if literature review progress falls >4 weeks behind schedule or if grant application is not draft-reviewed 14 days before deadline.',
  },
  {
    id: 'scientist',
    name: 'AI Food Scientist — KAFS',
    shortName: 'Scientist',
    role: 'Carrageenan blends, rheology analysis, gelation mechanics, and trial parameters optimization.',
    domain: 'SCIENCE',
    icon: FlaskConical,
    accentColor: 'text-teal-400',
    badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    memory: 'Analyzing synergies between Kappa Carrageenan and Locust Bean Gum. Reviewing FSSAI stabilizers limits.',
    inputs: 'Formulation lists, viscosity trial metrics, synergy matrices, processing logs.',
    rules: 'Keep water syneresis below 2%. Maintain total hydrocolloids dosage <= 1.5% in final dairy formulations.',
    advice: 'Combine Kappa Carrageenan with Locust Bean Gum in a 7:3 ratio to maximize gel strength and minimize syneresis at lower total dosage.',
    escalation: 'Escalate to CEO if active formulation trial costs exceed ₹450/kg or if rheology stability drops below threshold.',
  },
  {
    id: 'cfo',
    name: 'AI CFO — Wealth Engine',
    shortName: 'CFO',
    role: 'P&L tracking, investment allocation, cash flow management.',
    domain: 'FINANCE',
    icon: DollarSign,
    accentColor: 'text-yellow-600',
    badgeColor: 'bg-yellow-500/10 text-yellow-800 border-yellow-500/20',
    memory: 'Current net savings rate: 23%. SIP auto-invest active. Emergency fund covers 6 months. No high-interest debt.',
    inputs: 'Monthly income, business revenue, expense categories, investment returns.',
    rules: 'Never let savings rate drop below 20%. Review investment allocation quarterly. Flag any expense category exceeding ₹5000/month without approval.',
    advice: 'Increase SIP contribution by ₹2000/month following the KAFS revenue increase. Review insurance coverage before Q3 — current policy may be under-insured.',
    escalation: 'Escalate if monthly net cash flow turns negative or savings rate drops below 15% for 2 consecutive months.',
  },
  {
    id: 'health',
    name: 'AI Health Coach',
    shortName: 'Health',
    role: 'Sleep optimization, nutrition, physical performance, mental recovery.',
    domain: 'HEALTH',
    icon: Heart,
    accentColor: 'text-rose-500',
    badgeColor: 'bg-rose-500/10 text-rose-800 border-rose-500/20',
    memory: 'Avg sleep: 6.2h (target 7.5h). Workout frequency: 3x/week. Water intake tracking inconsistent. No tracked meditation days this week.',
    inputs: 'Daily health logs, weight, sleep hours, energy levels, workout completions.',
    rules: 'Flag if sleep < 6h for 2 days. Recommend cold recovery if workout intensity spikes. Track dehydration signals.',
    advice: 'Add a 15-minute evening wind-down routine (no screens after 10:30 PM) to improve sleep onset. Your 6.2h average is creating compounding cognitive debt.',
    escalation: 'Escalate to COO and Risk Engine if energy levels are < 4/10 for 5+ consecutive days.',
  },
  {
    id: 'brand',
    name: 'AI Brand Strategist',
    shortName: 'Brand',
    role: 'Personal brand, LinkedIn authority, content pipeline, thought leadership.',
    domain: 'BRAND',
    icon: Globe,
    accentColor: 'text-sky-500',
    badgeColor: 'bg-sky-500/10 text-sky-800 border-sky-500/20',
    memory: 'LinkedIn: 0 posts last 14 days. Target: 3 posts/week. Thought leadership topics: Carrageenan applications, Food hydrocolloids, AI for food R&D.',
    inputs: 'Content calendar, posting cadence, LinkedIn analytics, audience growth.',
    rules: 'Minimum 2 posts/week on LinkedIn. Each post must include a specific insight or data point, not just an opinion.',
    advice: 'Write a "Lessons from Carrageenan formulation trials" LinkedIn post this week — it positions you as a domain expert and attracts both B2B customers and PhD mentors.',
    escalation: 'Escalate if content output falls to 0 posts in 3 consecutive weeks.',
  },
  {
    id: 'exam',
    name: 'AI Exam Strategist',
    shortName: 'Exams',
    role: 'Government exam preparation, mock score tracking, study scheduling.',
    domain: 'EXAMS',
    icon: BookOpen,
    accentColor: 'text-orange-500',
    badgeColor: 'bg-orange-500/10 text-orange-850 border-orange-500/20',
    memory: 'Mock test scores averaging 64% (target 75%). Low score in Food Law chapters. 8 study modules remaining.',
    inputs: 'Mock test results, subject study logs, time spent on exam prep.',
    rules: 'Never let daily revision fall below 30 mins. Flag mock score drops immediately.',
    advice: 'Dedicate 1 study block to FSSAI Additive Limits legislation today. This matches high-frequency questions in historical exams.',
    escalation: 'Escalate to CEO if study hours fall below target for 7 consecutive days.',
  },
  {
    id: 'automation',
    name: 'AI Automation Hub',
    shortName: 'Automation',
    role: 'Active workflows trigger, webhook health logs, background scraper monitoring.',
    domain: 'AUTOMATIONS',
    icon: Cpu,
    accentColor: 'text-cyan-500',
    badgeColor: 'bg-cyan-500/10 text-cyan-850 border-cyan-500/20',
    memory: '4 n8n nodes operational. Lead capture webhook healthy. Patent scraper last ran 2 days ago.',
    inputs: 'Webhook latency stats, error counters, script automation outputs.',
    rules: 'Auto-retry failed scripts up to 3 times. Queue B2B leads when webhook is unreachable.',
    advice: 'Trigger lead sync manually if webhook logs show 3+ connection errors. Check n8n server memory allocation.',
    escalation: 'Escalate to COO if webhook fails continuously for 12 hours.',
  },
  {
    id: 'security',
    name: 'AI Security Auditor',
    shortName: 'Security',
    role: 'Database rules, private keys checks, browser auth verification.',
    domain: 'SECURITY',
    icon: Bot,
    accentColor: 'text-purple-500',
    badgeColor: 'bg-purple-500/10 text-purple-800 border-purple-500/20',
    memory: 'Dexie database local storage encryption active. Row-level security rules compiled on Supabase schemas.',
    inputs: 'Client storage size, row security logs, authentication attempts.',
    rules: 'Never cache private keys in browser session storage. Reject unencrypted local database exports.',
    advice: 'Verify Row-Level Security parameters on Supabase before pushing database changes. Keep offline backups encrypted.',
    escalation: 'Escalate immediately if unauthorized authentication attempt is logged.',
  }
];

const AGENT_RESPONSES: Record<string, string[]> = {
  ceo: [
    "AI CEO: Our primary focus is expanding KAFS stabilizers brand authority. Ensure your LinkedIn posting schedule aligns with recent formulation trial insights.",
    "AI CEO: Long-term compounding demands that we shortlist R&D facility spots this quarter. Review regional tax incentives before locking the final location."
  ],
  coo: [
    "AI COO: Average sleep is currently 6.2 hours. Recommend setting screen downtime at 10:30 PM to recover cognitive focus.",
    "AI COO: We have 3 critical tasks overdue. Re-rank priorities and delegate low-leverage steps to automation scripts."
  ],
  sales: [
    "AI Sales: Follow up with Dr. Ramesh Kumar at Heritage Foods today. The sample dispatch trial window closes shortly.",
    "AI Sales: Pipeline is currently ₹13 Lakhs. High value B2B opportunities require structured pitch slide decks."
  ],
  research: [
    "AI Research: Lit review is 2 weeks behind. Dedicate 2 hours of solid writing time tomorrow morning.",
    "AI Research: The DBT grant application deadline is approaching. Ensure your formulation abstract draft is formatted correctly."
  ],
  scientist: [
    "AI Scientist: Viscosity tests on Kappa-Iota blends show a shear-thinning behavior. Recommended processing temperature is 80°C for complete hydration.",
    "AI Scientist: Adjusting Locust Bean Gum percentage to 0.4% in the stabilizer blend will yield a cohesive gel without syneresis under pasteurization."
  ]
};

export default function AIBoardPage() {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const [activeAgentId, setActiveAgentId] = useState('ceo');
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([
    {
      agentId: 'system',
      from: 'system',
      text: 'KGOS AI Executive Board initialized. 11 specialized agents active. Select an agent and begin your strategic consultation.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      agentId: 'coo',
      from: 'agent',
      text: 'AI COO online. Ready to optimize your daily execution and flag performance gaps. What are your top 3 priorities today?',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeAgent = AGENTS.find(a => a.id === activeAgentId)!;

  // Pull live context from DB
  const recentTasks = useLiveQuery(() =>
    db.tasks.where('status').notEqual('DONE').limit(5).toArray()
  ) ?? [];
  const recentHealth = useLiveQuery(() =>
    db.healthLogs.orderBy('date').reverse().limit(3).toArray()
  ) ?? [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  const switchAgent = (agentId: string) => {
    const agent = AGENTS.find(a => a.id === agentId)!;
    setActiveAgentId(agentId);
    
    if (isLoggedIn) {
      setChatLogs(prev => [...prev, {
        agentId: agentId,
        from: 'system',
        text: `--- Switched to ${agent.name} ---`,
        timestamp: new Date().toLocaleTimeString(),
      }, {
        agentId: agentId,
        from: 'agent',
        text: agent.advice,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } else {
      setChatLogs([
        {
          agentId: 'system',
          from: 'system',
          text: '--- TELEMETRY GATED MODE ---',
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          agentId: agentId,
          from: 'agent',
          text: `I am the ${agent.name}. I monitor ${agent.domain.toLowerCase()} metrics and parameters. Unlock the Executive Command Console to activate my real-time telemetry assessment engine.`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !isLoggedIn) return;

    const userMsg: ChatMessage = {
      agentId: activeAgentId,
      from: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    const responses = AGENT_RESPONSES[activeAgentId] ?? [];
    const responseText = responses[Math.floor(Math.random() * responses.length)] ??
      `${activeAgent.name}: Analyzing your query based on domain rules and current memory...`;

    const agentMsg: ChatMessage = {
      agentId: activeAgentId,
      from: 'agent',
      text: responseText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatLogs(prev => [...prev, userMsg, agentMsg]);
    setChatInput('');
  };

  // ─── Public View Layout (isLoggedIn === false) ───
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9F8F5] text-[#2E3A47] pb-24">
        
        {/* Subheader */}
        <section className="bg-[#1B2B3B] text-[#F9F8F5] py-16 px-6 md:px-12 relative overflow-hidden border-b border-[#F9F8F5]/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(58,107,110,0.12),transparent_70%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4892A] font-bold">AI EXECUTIVE BOARD // DOMAIN DIRECTORS</span>
            <h1 className="text-3xl md:text-4xl font-serif tracking-wider uppercase">
              Agent Advisory Panel
            </h1>
            <p className="text-xs font-mono text-[#F9F8F5]/60 uppercase tracking-widest max-w-xl">
              11 specialized decision agents mapping physical formulations, schedules, and wealth ledgers.
            </p>
          </div>
        </section>

        {/* Board Display Grid */}
        <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2E3A47]/40 block mb-2 px-1">Board Members ({AGENTS.length})</span>
            {AGENTS.map(agent => {
              const Icon = agent.icon;
              const isActive = agent.id === activeAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => switchAgent(agent.id)}
                  className={`p-3 border rounded-xl text-left transition-all group flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#1B2B3B]/5 border-[#C4892A] shadow-sm'
                      : 'bg-[#F9F8F5] border-[#1B2B3B]/10 hover:bg-[#1B2B3B]/5'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-[#C4892A]/10' : 'bg-[#1B2B3B]/5'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C4892A]' : 'text-[#2E3A47]/60'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-[#1B2B3B]' : 'text-[#2E3A47]/80'}`}>
                      {agent.shortName}
                    </div>
                    <div className="text-[8px] font-mono text-[#2E3A47]/40 truncate">{agent.domain}</div>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-[#C4892A] flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Details & locked console */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Agent details */}
            <div className="bg-[#F9F8F5] border border-[#1B2B3B]/10 rounded-xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-[#1B2B3B]/5 pb-3">
                <div className="flex items-center gap-2">
                  {React.createElement(activeAgent.icon, { className: `w-4 h-4 text-[#C4892A]` })}
                  <h3 className="font-serif font-bold text-lg text-[#1B2B3B]">{activeAgent.name}</h3>
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider bg-[#3A6B6E]/10 text-[#3A6B6E] px-2.5 py-0.5 rounded border border-[#3A6B6E]/20`}>
                  {activeAgent.domain}
                </span>
              </div>

              <div className="flex flex-col gap-4 text-xs font-serif text-[#2E3A47]/80 leading-relaxed">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-[#1B2B3B]/10 rounded-xl bg-[#1B2B3B]/5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#2E3A47]/40 block mb-1">Agent Memory Profile</span>
                    <p>{activeAgent.memory}</p>
                  </div>
                  <div className="p-4 border border-[#1B2B3B]/10 rounded-xl bg-[#1B2B3B]/5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#2E3A47]/40 block mb-1">Inbound Inputs Context</span>
                    <p>{activeAgent.inputs}</p>
                  </div>
                </div>

                <div className="p-4 border border-[#1B2B3B]/10 rounded-xl bg-[#1B2B3B]/5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#2E3A47]/40 block mb-1">Decisions Rules & Safeguards</span>
                  <p>{activeAgent.rules}</p>
                </div>

                <div className="p-4 border border-[#C4892A]/30 rounded-xl bg-[#C4892A]/5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#C4892A] block mb-1 font-bold">Core Directive & Strategy</span>
                  <p className="text-[#1B2B3B] font-bold">{activeAgent.advice}</p>
                </div>

                <div className="p-4 border border-rose-800/10 rounded-xl bg-rose-50 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-800 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-rose-800 block mb-0.5 font-bold">Escalation Logic parameters</span>
                    <p className="text-rose-950">{activeAgent.escalation}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Gated terminal card */}
            <div className="bg-[#1B2B3B] text-[#F9F8F5] border border-[#F9F8F5]/10 rounded-xl p-6 shadow-md flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1.5px] z-10 flex flex-col items-center justify-center gap-3">
                <Lock className="w-8 h-8 text-[#C4892A]" />
                <h4 className="text-sm font-mono tracking-widest uppercase font-bold text-[#F9F8F5]">Telemetry Consultation Locked</h4>
                <p className="text-[10px] text-[#F9F8F5]/60 max-w-xs text-center font-serif leading-relaxed">
                  Real-time chat consultations with board directors require full database orchestration. Enter the console to initiate query sessions.
                </p>
              </div>

              <span className="text-xs font-mono text-[#F9F8F5]/60 flex items-center gap-1.5 border-b border-[#F9F8F5]/10 pb-3">
                <Terminal className="w-4 h-4 text-[#C4892A]" /> CONSULT TERMINAL
              </span>

              <div className="flex flex-col gap-4">
                <div className="bg-zinc-950 rounded-lg p-4 h-48 overflow-y-auto flex flex-col gap-3 font-mono text-[10px] text-zinc-500">
                  <div className="text-center text-zinc-700">--- Switched to {activeAgent.shortName} ---</div>
                  <div>
                    <span className="text-[#C4892A] block uppercase font-bold mb-0.5">{activeAgent.shortName}</span>
                    <span>I am contextually aware of CRM pipelines, study sheets, and health indices...</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    disabled
                    type="text"
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-500 outline-none flex-1 font-mono"
                    placeholder="Consultation Locked..."
                  />
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-650 text-xs font-semibold font-mono"
                  >
                    SEND
                  </button>
                </div>
              </div>
            </div>

          </div>

        </section>

      </div>
    );
  }

  // ─── Private ERP Console View (isLoggedIn === true) ───
  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-500" />
          AI Executive Board
        </h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          11 specialized AI agents running in parallel. Each monitors its domain and surfaces your highest-value action.
        </p>
      </div>

      {/* Live System Brief */}
      {(recentTasks.length > 0 || recentHealth.length > 0) && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400 block">Live System Context</span>
            <p className="text-xs text-zinc-300 mt-1">
              {recentTasks.length > 0 && `${recentTasks.length} open tasks in pipeline. `}
              {recentHealth.length > 0 && `Last health entry: ${recentHealth[0]?.date}. `}
              All agents are contextually aware of your current data.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent List — Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 px-1">
            Board Members ({AGENTS.length})
          </div>
          {AGENTS.map(agent => {
            const Icon = agent.icon;
            const isActive = agent.id === activeAgentId;
            return (
              <button
                key={agent.id}
                onClick={() => switchAgent(agent.id)}
                className={`p-3 border rounded-xl text-left transition-all group flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 border-blue-500/40'
                    : 'bg-zinc-950/40 border-zinc-800 hover:bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-blue-500/20' : 'bg-zinc-800'
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? agent.accentColor : 'text-zinc-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {agent.shortName}
                  </div>
                  <div className="text-[9px] text-zinc-600 truncate">{agent.domain}</div>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Agent Control Center */}
          <Card header={
            <div className="flex items-center gap-3">
              {React.createElement(activeAgent.icon, { className: `w-4 h-4 ${activeAgent.accentColor}` })}
              <span className="text-zinc-200 font-semibold">{activeAgent.name}</span>
              <span className={`ml-auto text-[9px] font-mono border px-2 py-0.5 rounded ${activeAgent.badgeColor}`}>
                {activeAgent.domain}
              </span>
            </div>
          }>
            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Agent Memory</span>
                  <p className="text-zinc-300 leading-relaxed">{activeAgent.memory}</p>
                </div>
                <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Inputs & Context</span>
                  <p className="text-zinc-300 leading-relaxed">{activeAgent.inputs}</p>
                </div>
              </div>

              <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Domain Rules & Constraints</span>
                <p className="text-zinc-300 leading-relaxed">{activeAgent.rules}</p>
              </div>

              <div className={`p-3.5 rounded-lg border border-opacity-30`}
                style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3" /> Core Directive
                </span>
                <p className="text-zinc-200 font-medium leading-relaxed">{activeAgent.advice}</p>
              </div>

              <div className="p-3 border border-rose-800/30 rounded-lg bg-rose-505 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">Escalation Logic</span>
                  <p className="text-zinc-300 leading-relaxed">{activeAgent.escalation}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Terminal */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-zinc-500" />
              Consult {activeAgent.shortName}
              <span className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500">Active</span>
              </span>
            </span>
          }>
            <div className="flex flex-col gap-4">
              {/* Chat Log */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 h-64 overflow-y-auto flex flex-col gap-2.5 scroll-smooth">
                {chatLogs.map((log, i) => (
                  <div key={i} className={`flex flex-col ${log.from === 'user' ? 'items-end' : 'items-start'}`}>
                    {log.from === 'system' ? (
                      <div className="text-[10px] text-zinc-600 font-mono text-center w-full">{log.text}</div>
                    ) : (
                      <div className={`max-w-[85%] ${log.from === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                          log.from === 'user'
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-200'
                            : 'bg-zinc-800/60 border border-zinc-700/50 text-zinc-300'
                        }`}>
                          {log.from === 'agent' && (
                            <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">
                              {AGENTS.find(a => a.id === log.agentId)?.shortName ?? 'Agent'}
                            </span>
                          )}
                          {log.text}
                        </div>
                        <div className="text-[9px] text-zinc-700 mt-0.5 font-mono">{log.timestamp}</div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-200 outline-none flex-1 focus:border-blue-600 transition-colors"
                  placeholder={`Ask ${activeAgent.shortName} anything about ${activeAgent.domain.toLowerCase()}...`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-505 text-white flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
