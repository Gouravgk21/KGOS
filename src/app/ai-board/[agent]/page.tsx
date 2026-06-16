'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '@/components/ui/Card';
import { db } from '@/db/database';
import { useAppStore } from '@/store/useAppStore';
import {
  Cpu, Terminal, ShieldAlert, Sparkles, Send, Bot, ChevronLeft,
  Brain, TrendingUp, Users, Beaker, BookOpen, Heart, DollarSign,
  Target, Zap, Globe, Lock, FlaskConical, Play, CheckSquare, ListTodo
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
  tools: { name: string; description: string; response: string }[];
}

interface ChatMessage {
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
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    memory: 'Monitoring DECADE and 5-YEAR goal horizon. Aware of KAFS ₹100Cr expansion target by 2036. PhD completion milestone critical for credibility unlocks.',
    inputs: 'Business revenue forecasts, macro food market trends, PhD milestones, brand positioning.',
    rules: 'Prioritize long-term capital compounding over short-term revenue. R&D formulation facility setup must remain on the critical path.',
    advice: 'Focus 80% of quarterly energy on Carrageenan blend formulation plant shortlisting and PhD framework completion. These are irreversible leverage points.',
    escalation: 'Escalate to board if quarterly goal completion falls below 40% when deadline is <30 days away.',
    tools: [
      { name: 'Evaluate 10-Year Goals', description: 'Projects current velocity against decade roadmap.', response: 'AI CEO: Current velocity projects decade roadmap completion by Q3 2035. Key bottleneck identified: Science R&D credentials.' },
      { name: 'Capital Allocation Model', description: 'Simulates compounding returns from KAFS re-investment.', response: 'AI CEO: Re-investing 45% of gross profit into R&D facility yields an estimated ₹2.3Cr valuation lift within 18 months.' }
    ]
  },
  {
    id: 'coo',
    name: 'AI COO — Daily Execution',
    shortName: 'COO',
    role: 'Daily priority planning, habit auditing, energy management.',
    domain: 'OPERATIONS',
    icon: Zap,
    accentColor: 'text-amber-500',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    memory: 'Sleep average is currently 6.2h. Habit completion rate at 78%. Morning energy window is 09:00–12:00.',
    inputs: 'Daily task completions, sleep logs, exercise logs, energy ratings.',
    rules: 'Flag burnout warning if sleep < 6h for 2 consecutive nights. Re-rank daily tasks by ROI × urgency matrix.',
    advice: 'Shift highest-cognitive tasks (formulation writing, research drafting) to 9–11 AM slot. Protect Saturday mornings as strategic review blocks.',
    escalation: 'Escalate to Risk Engine if burnout indicator rises to HIGH for 3+ consecutive days.',
    tools: [
      { name: 'Audit Daily Energy', description: 'Cross-checks energy ratings with task completion ratios.', response: 'AI COO: Energy window peaked at 10:30 AM. Task output drops by 60% after 4:00 PM. Advise shifting high-cognitive formulation tasks to AM.' },
      { name: 'Re-rank Overdue Tasks', description: 'Re-prioritizes task list based on ROI value.', response: 'AI COO: Re-ranked 5 overdue tasks. Formulation Lab v3 review shifted to priority #1 (ROI value: High).' }
    ]
  },
  {
    id: 'sales',
    name: 'AI Sales Director',
    shortName: 'Sales',
    role: 'CRM pipeline, lead conversion, B2B proposal strategy.',
    domain: 'SALES',
    icon: TrendingUp,
    accentColor: 'text-emerald-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    memory: 'CRM pipeline: ₹13 Lakhs active. Heritage Foods trial is highest-conversion stage. 2 proposals due this week.',
    inputs: 'Lead stages, sample dispatch logs, follow-up cadence, proposal deadlines.',
    rules: 'Auto-flag follow-up 5 days after sample dispatch. Escalate if proposal conversion rate drops below 15%.',
    advice: 'Follow up with Dr. Ramesh Kumar at Heritage Foods today — sample feedback is due and silence beyond 5 days risks losing trial momentum.',
    escalation: 'Escalate if >3 qualified leads go cold in a 30-day window without contact.',
    tools: [
      { name: 'Analyze Conversion Funnel', description: 'Evaluates drop-offs across B2B lead pipeline.', response: 'AI Sales: Highest drop-off is in the "Sample Sent -> Trial" stage. Action: Reduce feedback cycle from 10 days to 4 days.' },
      { name: 'Draft B2B Pitch Hook', description: 'Generates B2B cold outreach hooks for hydrocolloids.', response: 'AI Sales: "Subject: Reducing syneresis in dairy by 22% - KAFS stabilizers trial. Pitch: We noticed your recent yogurt line relaunch..."' }
    ]
  },
  {
    id: 'research',
    name: 'AI Research Director',
    shortName: 'Research',
    role: 'PhD progress, paper submissions, grant scouting.',
    domain: 'RESEARCH',
    icon: Beaker,
    accentColor: 'text-violet-500',
    badgeColor: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    memory: 'PhD literature review is 2 weeks behind schedule. DBT grant window closes in 6 weeks. 1 paper in drafting stage.',
    inputs: 'Research milestones, publication pipeline, grant deadlines, advisor meetings.',
    rules: 'Minimum 4h/week dedicated research writing block. All grant opportunities must be scored before ignoring.',
    advice: 'Prioritize completing the literature review chapter this week — it unblocks the experimental design phase, which is on the critical path of PhD completion.',
    escalation: 'Escalate if PhD milestone slippage exceeds 4 weeks or if a high-alignment grant deadline is <14 days away.',
    tools: [
      { name: 'Grant Alignment Scouter', description: 'Compares active research topics with open DBT/ICAR grants.', response: 'AI Research: DBT Early Career Fellowship found with 85% alignment. Closing: 6 weeks. Action: Finalize Carrageenan draft abstract.' },
      { name: 'Literature Gap Finder', description: 'Finds thematic voids in current paper database.', response: 'AI Research: Rheology profiles of Iota Carrageenan mixed with indigenous gums has low literature coverage. Ideal niche for publication #2.' }
    ]
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
    tools: [
      { name: 'Analyze Carrageenan Synergies', description: 'Models viscosity enhancement curves between Carrageenan and LBG.', response: 'AI Scientist: Synergy index calculated at 1.45 (Optimal). Recommended ratio: 70% Kappa Carrageenan / 30% Locust Bean Gum.' },
      { name: 'FSSAI Compliance Audit', description: 'Checks formulation ingredient levels against FSSAI food code limits.', response: 'AI Scientist: Formulation v3 compliant. Total stabilizer dosage 0.8% is below the max 1.5% FSSAI limit for category 1.2.2 (dairy).' }
    ]
  },
  {
    id: 'cfo',
    name: 'AI CFO — Wealth Engine',
    shortName: 'CFO',
    role: 'P&L tracking, investment allocation, cash flow management.',
    domain: 'FINANCE',
    icon: DollarSign,
    accentColor: 'text-yellow-500',
    badgeColor: 'bg-yellow-500/10 text-yellow-350 border-yellow-500/20',
    memory: 'Current net savings rate: 23%. SIP auto-invest active. Emergency fund covers 6 months. No high-interest debt.',
    inputs: 'Monthly income, business revenue, expense categories, investment returns.',
    rules: 'Never let savings rate drop below 20%. Review investment allocation quarterly. Flag any expense category exceeding ₹5000/month without approval.',
    advice: 'Increase SIP contribution by ₹2000/month following the KAFS revenue increase. Review insurance coverage before Q3 — current policy may be under-insured.',
    escalation: 'Escalate if monthly net cash flow turns negative or savings rate drops below 15% for 2 consecutive months.',
    tools: [
      { name: 'Savings Burn Rate Audit', description: 'Calculates runway under static cash flow scenarios.', response: 'AI CFO: Current personal runway is 18.2 months based on static savings cash pool. Financial health is robust.' },
      { name: 'Business Tax Estimator', description: 'Projects quarterly GST and income tax liability.', response: 'AI CFO: Estimated Q2 tax liabilities: GST ₹32,000, Income Tax provision ₹48,000. Retain ₹80,000 in liquid business ledger.' }
    ]
  },
  {
    id: 'health',
    name: 'AI Health Coach',
    shortName: 'Health',
    role: 'Sleep optimization, nutrition, physical performance, mental recovery.',
    domain: 'HEALTH',
    icon: Heart,
    accentColor: 'text-rose-500',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    memory: 'Avg sleep: 6.2h (target 7.5h). Workout frequency: 3x/week. Water intake tracking inconsistent. No tracked meditation days this week.',
    inputs: 'Daily health logs, weight, sleep hours, energy levels, workout completions.',
    rules: 'Flag if sleep < 6h for 2 days. Recommend cold recovery if workout intensity spikes. Track dehydration signals.',
    advice: 'Add a 15-minute evening wind-down routine (no screens after 10:30 PM) to improve sleep onset. Your 6.2h average is creating compounding cognitive debt.',
    escalation: 'Escalate to COO and Risk Engine if energy levels are < 4/10 for 5+ consecutive days.',
    tools: [
      { name: 'Calculate Sleep Deficit', description: 'Tracks rolling sleep debt over the last 14 days.', response: 'AI Health: Rolling sleep debt is +16 hours. High correlation with late-night screen time. Action: Block phone screens after 10:30 PM.' },
      { name: 'Workout Intensity Auditor', description: 'Reviews weekly logs to calculate muscle recovery limits.', response: 'AI Health: Cardiovascular logs show a 15% overload. Recommended recovery: Rest day tomorrow, focus on hydration.' }
    ]
  },
  {
    id: 'brand',
    name: 'AI Brand Strategist',
    shortName: 'Brand',
    role: 'Personal brand, LinkedIn authority, content pipeline, thought leadership.',
    domain: 'BRAND',
    icon: Globe,
    accentColor: 'text-sky-500',
    badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    memory: 'LinkedIn: 0 posts last 14 days. Target: 3 posts/week. Thought leadership topics: Carrageenan applications, Food hydrocolloids, AI for food R&D.',
    inputs: 'Content calendar, posting cadence, LinkedIn analytics, audience growth.',
    rules: 'Minimum 2 posts/week on LinkedIn. Each post must include a specific insight or data point, not just an opinion.',
    advice: 'Write a "Lessons from Carrageenan formulation trials" LinkedIn post this week — it positions you as a domain expert and attracts both B2B customers and PhD mentors.',
    escalation: 'Escalate if content output falls to 0 posts in 3 consecutive weeks.',
    tools: [
      { name: 'Analyze Post Engagement', description: 'Correlates posting hours with reactions and reach.', response: 'AI Brand: Posts published between 8:30-9:30 AM get 35% higher initial impressions. Topic engagement peaks on hydrocolloid chemistry.' },
      { name: 'Generate Hook variations', description: 'Creates hook templates based on current formulation successes.', response: 'AI Brand: Hook 1: "We reduced syneresis in dairy blends by 20% using a 70:30 ratio. Here is the molecular science behind why LBG works..."' }
    ]
  },
  {
    id: 'exam',
    name: 'AI Exam Strategist',
    shortName: 'Exams',
    role: 'Government exam preparation, mock score tracking, study scheduling.',
    domain: 'EXAMS',
    icon: BookOpen,
    accentColor: 'text-orange-500',
    badgeColor: 'bg-orange-500/10 text-orange-350 border-orange-500/20',
    memory: 'Mock test scores averaging 64% (target 75%). Low score in Food Law chapters. 8 study modules remaining.',
    inputs: 'Mock test results, subject study logs, time spent on exam prep.',
    rules: 'Never let daily revision fall below 30 mins. Flag mock score drops immediately.',
    advice: 'Dedicate 1 study block to FSSAI Additive Limits legislation today. This matches high-frequency questions in historical exams.',
    escalation: 'Escalate to CEO if study hours fall below target for 7 consecutive days.',
    tools: [
      { name: 'Predict Exam Score', description: 'Regresses mock scores to predict current readiness.', response: 'AI Exams: Predicted exam score based on 64% mock average: 320/500 marks. Target marks needed: 380. Study focus: Food Regulations Act.' },
      { name: 'Isolate Syllabus Weaknesses', description: 'Drills down into incorrect mock test logs.', response: 'AI Exams: 72% of incorrect mock answers were in "Food Safety Standards & Regulations". Scheduled 3 targeted review blocks.' }
    ]
  },
  {
    id: 'automation',
    name: 'AI Automation Hub',
    shortName: 'Automation',
    role: 'Active workflows trigger, webhook health logs, background scraper monitoring.',
    domain: 'AUTOMATIONS',
    icon: Cpu,
    accentColor: 'text-cyan-500',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    memory: '4 n8n nodes operational. Lead capture webhook healthy. Patent scraper last ran 2 days ago.',
    inputs: 'Webhook latency stats, error counters, script automation outputs.',
    rules: 'Auto-retry failed scripts up to 3 times. Queue B2B leads when webhook is unreachable.',
    advice: 'Trigger lead sync manually if webhook logs show 3+ connection errors. Check n8n server memory allocation.',
    escalation: 'Escalate to COO if webhook fails continuously for 12 hours.',
    tools: [
      { name: 'Test n8n Webhook Latency', description: 'Pings active n8n nodes to check network response.', response: 'AI Automation: Webhook response is 45ms. Nodes healthy. Memory utilization: 34%.' },
      { name: 'Verify Scraper Schedules', description: 'Checks local script task scheduler for cron runs.', response: 'AI Automation: Patent scraper cron is in STANDBY. Next run: 2026-06-15 02:00:00.' }
    ]
  },
  {
    id: 'security',
    name: 'AI Security Auditor',
    shortName: 'Security',
    role: 'Database rules, private keys checks, browser auth verification.',
    domain: 'SECURITY',
    icon: Bot,
    accentColor: 'text-purple-500',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    memory: 'Dexie database local storage encryption active. Row-level security rules compiled on Supabase schemas.',
    inputs: 'Client storage size, row security logs, authentication attempts.',
    rules: 'Never cache private keys in browser session storage. Reject unencrypted local database exports.',
    advice: 'Verify Row-Level Security parameters on Supabase before pushing database changes. Keep offline backups encrypted.',
    escalation: 'Escalate immediately if unauthorized authentication attempt is logged.',
    tools: [
      { name: 'Audit Storage Encryption', description: 'Scans LocalStorage for plaintext keys.', response: 'AI Security: Plaintext scanning complete. 0 private credentials detected in local session storage. Encrypted containers fully verified.' },
      { name: 'Validate Supabase RLS Rules', description: 'Simulates tenant queries to test bypass security.', response: 'AI Security: 12 tables tested. RLS rules successfully block cross-tenant read/write queries. Authentication handshake is secure.' }
    ]
  }
];

export default function AgentConsolePage({ params }: { params: Promise<{ agent: string }> }) {
  const resolvedParams = React.use(params);
  const agentId = resolvedParams.agent;
  
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [runningTool, setRunningTool] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const agent = AGENTS.find(a => a.id === agentId);

  // Live query for open tasks
  const openTasks = useLiveQuery(() =>
    db.tasks.where('status').notEqual('DONE').toArray()
  ) ?? [];

  // Load chat logs from LocalStorage
  useEffect(() => {
    if (agent && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`kgos_agent_chat_${agent.id}`);
      if (stored) {
        setChatLogs(JSON.parse(stored));
      } else {
        // Initial agent message
        const initialLogs: ChatMessage[] = [
          {
            from: 'system',
            text: `Connected to ${agent.name}. Real-time telemetry monitoring is active.`,
            timestamp: new Date().toLocaleTimeString()
          },
          {
            from: 'agent',
            text: agent.advice,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        setChatLogs(initialLogs);
        localStorage.setItem(`kgos_agent_chat_${agent.id}`, JSON.stringify(initialLogs));
      }
    }
  }, [agent]);

  // Scroll to bottom on log change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  if (!agent) {
    return (
      <div className="p-6 text-center text-rose-400 font-mono">
        Error: AI Agent "{agentId}" not found.
        <div className="mt-4">
          <Link href="/ai-board" className="text-zinc-400 hover:text-white underline">Return to AI Board</Link>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      from: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Simulate AI thinking and reply
    const simulatedReply = `${agent.name}: Acknowledged. Query evaluated against rules. Current local parameter is aligned.`;
    const agentMsg: ChatMessage = {
      from: 'agent',
      text: simulatedReply,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newLogs = [...chatLogs, userMsg, agentMsg];
    setChatLogs(newLogs);
    localStorage.setItem(`kgos_agent_chat_${agent.id}`, JSON.stringify(newLogs));
    setChatInput('');
  };

  const handleRunTool = (tool: typeof agent.tools[0]) => {
    setRunningTool(tool.name);
    
    // Simulate run delay
    setTimeout(() => {
      const runLog: ChatMessage = {
        from: 'system',
        text: `Executing tool: [${tool.name}]...`,
        timestamp: new Date().toLocaleTimeString()
      };
      const responseLog: ChatMessage = {
        from: 'agent',
        text: tool.response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      const newLogs = [...chatLogs, runLog, responseLog];
      setChatLogs(newLogs);
      localStorage.setItem(`kgos_agent_chat_${agent.id}`, JSON.stringify(newLogs));
      setRunningTool(null);
    }, 800);
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;

    const task = openTasks.find(t => t.id === parseInt(selectedTaskId));
    if (!task) return;

    const assignLog: ChatMessage = {
      from: 'user',
      text: `Assigning Task to Agent: "${task.title}" (Priority: ${task.priority})`,
      timestamp: new Date().toLocaleTimeString()
    };

    const acceptLog: ChatMessage = {
      from: 'agent',
      text: `Task accepted. I have logged this to my active stack. I will monitor standard limits and trigger alerts if rules are violated.`,
      timestamp: new Date().toLocaleTimeString()
    };

    const newLogs = [...chatLogs, assignLog, acceptLog];
    setChatLogs(newLogs);
    localStorage.setItem(`kgos_agent_chat_${agent.id}`, JSON.stringify(newLogs));
    setSelectedTaskId('');
    
    // Add record to agent memory
    try {
      await db.agentMemory.add({
        agentId: agent.id,
        agentName: agent.shortName,
        content: `Assigned task: ${task.title}. Status: Monitoring.`,
        type: 'task',
        relatedId: task.id,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearChat = () => {
    if (!window.confirm('Wipe chat history for this agent?')) return;
    const initialLogs: ChatMessage[] = [
      {
        from: 'system',
        text: `Connected to ${agent.name}. Chat history reset.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    setChatLogs(initialLogs);
    localStorage.setItem(`kgos_agent_chat_${agent.id}`, JSON.stringify(initialLogs));
  };

  const Icon = agent.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <Link href="/ai-board" className="p-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <Icon className={`w-5 h-5 ${agent.accentColor}`} />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 font-display">{agent.name}</h1>
            <span className={`text-[9px] font-mono border px-2.5 py-0.5 rounded tracking-wide uppercase ${agent.badgeColor}`}>
              {agent.domain}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 uppercase font-mono tracking-wider">
            Dedicated Strategic Agent Console & Active Telemetry Diagnostics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Parameters & Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity profile */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Brain className="w-4 h-4 text-purple-400" /> AGENT COGNITIVE PROFILE
            </span>
          }>
            <div className="space-y-4 text-xs">
              <div className="p-3 border border-zinc-850 rounded bg-zinc-900/20">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Functional Mandate</span>
                <p className="text-zinc-300 leading-relaxed">{agent.role}</p>
              </div>

              <div className="p-3 border border-zinc-850 rounded bg-zinc-900/20">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Telemetry Inputs</span>
                <p className="text-zinc-300 leading-relaxed font-mono">{agent.inputs}</p>
              </div>

              <div className="p-3 border border-zinc-850 rounded bg-zinc-900/20">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Decision Safeguards</span>
                <p className="text-zinc-300 leading-relaxed italic">{agent.rules}</p>
              </div>

              <div className="p-3 border border-zinc-850 rounded bg-zinc-900/20">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Active Memory</span>
                <p className="text-zinc-300 leading-relaxed">{agent.memory}</p>
              </div>

              <div className="p-3 border border-rose-900/20 rounded bg-rose-950/5 flex items-start gap-2.5">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-0.5">Escalation Logic</span>
                  <p className="text-zinc-300 leading-relaxed">{agent.escalation}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Task assignment console */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <ListTodo className="w-4 h-4 text-blue-400" /> DELEGATE WORKLOAD
            </span>
          }>
            <form onSubmit={handleAssignTask} className="space-y-4 text-xs">
              <p className="text-[10px] text-zinc-550 leading-normal uppercase font-mono">
                Assign a task from your active agenda. The agent will monitor conditions and report milestones.
              </p>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Select Task</label>
                {openTasks.length === 0 ? (
                  <div className="text-[10px] text-zinc-550 py-2 italic font-mono">No active tasks in DB.</div>
                ) : (
                  <select
                    value={selectedTaskId}
                    onChange={e => setSelectedTaskId(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">-- Choose Task --</option>
                    {openTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        [{task.priority}] {task.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedTaskId || openTasks.length === 0}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !selectedTaskId
                    ? 'bg-zinc-900 border border-zinc-850 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#006D77] hover:bg-[#00B4D8] border border-transparent text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                DELEGATE TO AGENT
              </button>
            </form>
          </Card>
        </div>

        {/* Right Side: Chat & Capabilities */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Chat Terminal Console */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Terminal className="w-4 h-4 text-zinc-500" />
              Real-time Consult Console
              <span className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-zinc-500 font-mono">TELEMETRY SYNCED</span>
              </span>
            </span>
          }>
            <div className="flex flex-col gap-4">
              {/* Chat log */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-4 h-[420px] overflow-y-auto flex flex-col gap-3 scroll-smooth">
                {chatLogs.map((log, index) => (
                  <div key={index} className={`flex flex-col ${log.from === 'user' ? 'items-end' : 'items-start'}`}>
                    {log.from === 'system' ? (
                      <div className="text-[9px] text-zinc-650 font-mono py-1 text-center w-full uppercase tracking-wider">{log.text}</div>
                    ) : (
                      <div className={`max-w-[85%] ${log.from === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                          log.from === 'user'
                            ? 'bg-blue-900/20 border border-blue-500/20 text-blue-200'
                            : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300'
                        }`}>
                          {log.from === 'agent' && (
                            <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1 font-mono tracking-wide">
                              {agent.shortName}
                            </span>
                          )}
                          {log.text}
                        </div>
                        <div className="text-[8px] text-zinc-600 mt-1 font-mono">{log.timestamp}</div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input console */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-3 text-xs text-zinc-200 outline-none flex-1 focus:border-[#00B4D8] transition-colors font-mono"
                  placeholder={`Send parameters to ${agent.shortName} diagnostic buffer...`}
                />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 text-xs font-semibold font-mono cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  SEND
                </button>
              </form>

              <div className="flex justify-end">
                <button onClick={handleClearChat} className="text-[9px] font-mono text-zinc-600 hover:text-rose-400 cursor-pointer">
                  RESET CONSOLE BUFFER
                </button>
              </div>
            </div>
          </Card>

          {/* Interactive Agent Capabilities */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Sparkles className="w-4 h-4 text-[#D4A017] animate-pulse" /> ACTIVE AGENT TOOLS
            </span>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agent.tools.map((tool, index) => (
                <div key={index} className="p-3 border border-zinc-850 rounded bg-zinc-950 flex flex-col justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200 font-mono">{tool.name}</span>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{tool.description}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRunTool(tool)}
                      disabled={runningTool !== null}
                      className={`px-3 py-1.5 rounded text-[9px] font-mono font-bold cursor-pointer flex items-center gap-1 border transition-all ${
                        runningTool === tool.name
                          ? 'bg-blue-900/10 border-blue-500/30 text-blue-300 cursor-wait animate-pulse'
                          : runningTool !== null
                          ? 'bg-zinc-900 border-zinc-850 text-zinc-650 cursor-not-allowed'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5" />
                      {runningTool === tool.name ? 'RUNNING...' : 'RUN TOOL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
