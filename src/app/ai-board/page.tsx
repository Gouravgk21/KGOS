'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { Cpu, Terminal, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface Agent {
  name: string;
  role: string;
  memory: string;
  inputs: string;
  rules: string;
  advice: string;
  escalation: string;
}

export default function AIBoardPage() {
  const agents: Agent[] = [
    { 
      name: "AI CEO (Strategic Review)", 
      role: "Strategic alignment, annual and quarterly planning checks.",
      memory: "Monitors DECADE and 5-YEAR goals. Aware of KAFS expansion plans to ₹100Cr by 2036.",
      inputs: "Active business revenue forecasts, macro crop prices, and PhD completion milestones.",
      rules: "Always prioritize long-term capital compounding and R&D formulation facility milestones over short-term sales consulting.",
      advice: "Focus 80% of quarterly goals on the Carrageenan blend formulations blending plant setup. Shortlist candidate equipment suppliers by next week.",
      escalation: "Escalate if quarterly progress drops below 40% when target date is under 30 days away."
    },
    { 
      name: "AI COO (Daily Execution)", 
      role: "Daily priority planning and vital habits check-ins.",
      memory: "Sleep duration averages 6.2 hours. Habits checklist completion rate is 78%.",
      inputs: "Daily schedule, priority tasks, energy patterns.",
      rules: "Flag warning if sleep drops below 6 hours for 2 consecutive nights. Re-rank tasks by impact factor.",
      advice: "Your energy levels usually peak between 9 AM and 12 PM. Shift 'Formulate Carrageenan blend sample' to this morning slot.",
      escalation: "Escalate to Risk Engine if burnout indicator rises to high."
    },
    { 
      name: "AI Sales Director", 
      role: "CRM management, leads follow-ups, and conversion metrics.",
      memory: "Active CRM pipeline value: ₹13 Lakhs. High conversion stage is heritage trial.",
      inputs: "Lead stages, sample logs, proposal deadlines.",
      rules: "Auto-generate follow-up reminder 5 days after dispatching sample stabilizer kits.",
      advice: "Follow up with Dr. Ramesh Kumar at Heritage Foods today. The sample feedback is due.",
      escalation: "Flag if proposal conversion rate drops below 15%."
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeAgent = agents[activeIdx];
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState<string[]>([
    "System: Multi-Agent Board initialized successfully.",
    "AI CEO: Ready to analyze strategic horizon targets."
  ]);

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    setChatLogs([...chatLogs, `Kumar: ${chatInput}`, `${activeAgent.name}: Processing your request based on my domain rules and active memory cache...`]);
    setChatInput('');
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-500" />
          AI Executive Board
        </h1>
        <p className="text-sm text-zinc-400">Interact with your specialized AI executive agents overseeing business strategy, operations, sales, and health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar List */}
        <div className="flex flex-col gap-3">
          {agents.map((agent, idx) => (
            <button
              key={agent.name}
              onClick={() => setActiveIdx(idx)}
              className={`p-4 border rounded-xl text-left transition-all ${
                idx === activeIdx 
                  ? 'bg-blue-600/10 border-blue-500/50 text-white' 
                  : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900/40'
              }`}
            >
              <h4 className="text-sm font-semibold">{agent.name}</h4>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{agent.role}</p>
            </button>
          ))}
        </div>

        {/* Details Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card header={<span className="text-zinc-200 font-semibold">{activeAgent.name} Control Center</span>}>
            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/20">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Agent Memory</span>
                  <p className="text-zinc-300 mt-1 leading-relaxed">{activeAgent.memory}</p>
                </div>
                <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/20">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Inputs & Context</span>
                  <p className="text-zinc-300 mt-1 leading-relaxed">{activeAgent.inputs}</p>
                </div>
              </div>

              <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/20">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Domain Rules & Constraints</span>
                <p className="text-zinc-300 mt-1 leading-relaxed">{activeAgent.rules}</p>
              </div>

              <div className="p-3.5 border border-blue-900/30 rounded-lg bg-blue-500/5">
                <span className="text-[10px] uppercase font-bold text-blue-400 block flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Core Advice / Directive
                </span>
                <p className="text-zinc-200 font-medium mt-1 leading-relaxed text-sm">{activeAgent.advice}</p>
              </div>

              <div className="p-3 border border-rose-950/30 rounded-lg bg-rose-500/5 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">Escalation Logic</span>
                  <p className="text-zinc-300 mt-0.5 leading-relaxed">{activeAgent.escalation}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Shell */}
          <Card header={<span className="text-zinc-200 font-semibold flex items-center gap-2"><Terminal className="w-4 h-4 text-zinc-500" /> Interactive AI Terminal</span>}>
            <div className="flex flex-col gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 h-48 overflow-y-auto font-mono text-[11px] text-zinc-400 flex flex-col gap-2">
                {chatLogs.map((log, i) => (
                  <div key={i} className={log.startsWith('Kumar') ? 'text-blue-400' : log.startsWith('System') ? 'text-zinc-600' : 'text-zinc-300'}>
                    {log}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendQuery} className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none flex-1 focus:border-zinc-700"
                  placeholder={`Consult ${activeAgent.name}...`}
                />
                <button type="submit" className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
