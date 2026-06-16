'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Send,
  ChevronUp,
  Cpu,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Crown,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { db } from '@/db/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const AGENTS: Agent[] = [
  {
    id: 'aria',
    name: 'ARIA',
    title: 'COO',
    icon: Crown,
    color: '#006D77',
    description: 'Business Strategy',
  },
  {
    id: 'helix',
    name: 'HELIX',
    title: 'Food Scientist',
    icon: FlaskConical,
    color: '#00B4D8',
    description: 'Food Science & Formulation',
  },
  {
    id: 'nova',
    name: 'NOVA',
    title: 'Researcher',
    icon: BookOpen,
    color: '#D4A017',
    description: 'Research & Literature',
  },
  {
    id: 'echo',
    name: 'ECHO',
    title: 'Exam Coach',
    icon: GraduationCap,
    color: '#16A34A',
    description: 'Exam Preparation',
  },
  {
    id: 'atlas',
    name: 'ATLAS',
    title: 'Executive',
    icon: Cpu,
    color: '#F59E0B',
    description: 'Strategic Synthesis',
  },
];

function getDefaultAgent(pathname: string): Agent {
  if (pathname.includes('/formulation') || pathname.includes('/kafs'))
    return AGENTS[1];
  if (pathname.includes('/research')) return AGENTS[2];
  if (pathname.includes('/exams')) return AGENTS[3];
  if (pathname.includes('/executive')) return AGENTS[4];
  if (pathname.includes('/business')) return AGENTS[0];
  return AGENTS[4];
}

function getContextActions(pathname: string): string[] {
  if (
    pathname.includes('/formulation') ||
    pathname.includes('/kafs/ingredients')
  ) {
    return [
      'Optimize this formulation',
      'Suggest synergies',
      'Calculate cost efficiency',
    ];
  }
  if (pathname.includes('/research'))
    return ['Summarize key papers', 'Find research gaps', 'Suggest next steps'];
  if (pathname.includes('/business'))
    return ['Score my pipeline', 'Forecast Q3 revenue', 'Next best action'];
  if (pathname.includes('/exams'))
    return [
      'Build study plan',
      'Identify weak topics',
      'Create practice questions',
    ];
  if (pathname.includes('/executive'))
    return ['Weekly review', 'Prioritize today', 'Risk assessment'];
  return ['Summarize my week', 'What should I focus on?', 'Generate insights'];
}

export default function AIBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[4]);

  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Update default agent when route changes (only when closed)
  useEffect(() => {
    if (!isExpanded) setSelectedAgent(getDefaultAgent(pathname));
  }, [pathname, isExpanded]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Focus input on expand
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const contextActions = getContextActions(pathname);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);

      const assistantId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        abortRef.current = new AbortController();

        // Build history from current messages (before the new ones)
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            agentId: selectedAgent.id,
            agentName: selectedAgent.name,
            context: `Current page: ${pathname}`,
            history,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = (await res.json()) as { error?: string };
          throw new Error(errData.error ?? 'Request failed');
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk
            .split('\n')
            .filter((l) => l.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data) as { content?: string };
              if (parsed.content) {
                accumulated += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: accumulated }
                      : m
                  )
                );
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }

        // Persist conversation to agent memory in Dexie
        if (accumulated) {
          await db.agentMemory.add({
            agentId: selectedAgent.id,
            agentName: selectedAgent.name,
            content: `User: ${text}\nResponse: ${accumulated.slice(0, 500)}`,
            type: 'context',
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const errorMsg =
          err instanceof Error ? err.message : 'Something went wrong';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `⚠ ${errorMsg}` }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, messages, pathname, selectedAgent]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(inputValue);
    }
    if (e.key === 'Escape') setIsExpanded(false);
  };

  const handleCollapsedBarClick = () => setIsExpanded((prev) => !prev);

  const AgentIcon = selectedAgent.icon;

  return (
    <div
      className={`absolute bottom-12 md:bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        isExpanded ? 'h-96' : 'h-12'
      }`}
    >
      {/* ── Collapsed Handle Bar ─────────────────────────────────────── */}
      <div
        className="absolute bottom-0 w-full h-12 bg-[rgba(11,18,32,0.97)] backdrop-blur-md border-t border-[var(--border-subtle)] flex items-center px-4 md:px-6 cursor-pointer select-none"
        onClick={handleCollapsedBarClick}
        role="button"
        tabIndex={0}
        aria-label={isExpanded ? 'Collapse AI assistant' : 'Expand AI assistant'}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
      >
        {/* Left: Agent badge */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: selectedAgent.color }}
          >
            <AgentIcon className="w-3 h-3 text-white" />
          </div>
          <span className="font-mono text-xs font-bold text-white">
            {selectedAgent.name}
          </span>
          <span className="text-[var(--text-muted)] text-xs hidden sm:inline">·</span>
          <span className="text-[var(--text-muted)] text-xs hidden sm:inline truncate max-w-[160px] md:max-w-xs">
            {isExpanded
              ? selectedAgent.description
              : 'Click to open AI assistant'}
          </span>
        </div>

        {/* Right: quick action chips + status + chevron */}
        <div className="ml-auto flex items-center gap-2">
          {!isExpanded &&
            contextActions.slice(0, 2).map((action, i) => (
              <button
                key={i}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition-colors"
                style={{
                  background: 'rgba(0,180,216,0.08)',
                  color: 'var(--color-turquoise)',
                  border: '1px solid rgba(0,180,216,0.15)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setInputValue(action);
                  setIsExpanded(true);
                }}
                aria-label={`Quick action: ${action}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {action}
              </button>
            ))}

          <div className="flex items-center gap-1 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-green-400 hidden sm:inline">
              ONLINE
            </span>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* ── Expanded Panel ────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="absolute bottom-12 w-full h-[calc(100%-3rem)] flex bg-[#0B1220] border-t border-[var(--border-subtle)] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
          {/* Agent Selector Sidebar (desktop only) */}
          <div className="hidden md:flex w-52 flex-col border-r border-[var(--border-subtle)] bg-[#021E26] flex-shrink-0 overflow-y-auto">
            <div className="p-3 pb-1">
              <div className="section-label px-1">AI Agents</div>
            </div>
            <div className="flex flex-col gap-1 p-2">
              {AGENTS.map((agent) => {
                const Icon = agent.icon;
                const isActive = agent.id === selectedAgent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`flex items-center gap-2.5 p-2 rounded-[var(--radius-sm)] text-left transition-all ${
                      isActive
                        ? 'bg-[rgba(0,180,216,0.1)] border border-[rgba(0,180,216,0.2)]'
                        : 'hover:bg-[rgba(255,255,255,0.03)] border border-transparent'
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${agent.name}`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: agent.color }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-bold font-mono ${
                          isActive ? 'text-white' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">
                        {agent.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {messages.length === 0 ? (
                /* Empty state — context-aware prompts */
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: selectedAgent.color }}
                  >
                    <AgentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-sm">
                      {selectedAgent.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {selectedAgent.description}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-1 max-w-sm">
                    {contextActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => void sendMessage(action)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors font-mono hover:bg-[rgba(0,180,216,0.08)]"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Message bubbles */
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: selectedAgent.color }}
                        aria-hidden="true"
                      >
                        <AgentIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-[var(--radius-md)] px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[rgba(0,180,216,0.15)] text-white rounded-tr-sm'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-tl-sm'
                      }`}
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content || (
                        /* Typing indicator dots */
                        <span
                          className="inline-flex items-center gap-1 py-0.5"
                          aria-label="Thinking"
                        >
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                              style={{ animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div className="p-3 border-t border-[var(--border-subtle)] flex-shrink-0">
              <div className="flex gap-2 items-center">
                {/* Clear conversation button */}
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    className="btn-icon flex-shrink-0"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    className="input pr-10 text-sm"
                    placeholder={`Ask ${selectedAgent.name}…`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    aria-label={`Message ${selectedAgent.name}`}
                    autoComplete="off"
                  />
                  <button
                    onClick={() => void sendMessage(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center transition-all disabled:opacity-40"
                    style={{
                      background: inputValue.trim()
                        ? 'var(--color-teal)'
                        : 'transparent',
                      color: inputValue.trim() ? 'white' : 'var(--text-muted)',
                    }}
                    aria-label="Send message"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Mobile agent switcher (hidden on md+) */}
              <div className="flex md:hidden gap-1.5 mt-2 overflow-x-auto pb-0.5">
                {AGENTS.map((agent) => {
                  const Icon = agent.icon;
                  const isActive = agent.id === selectedAgent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all flex-shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-[var(--text-muted)] opacity-60'
                      }`}
                      style={{
                        background: isActive
                          ? agent.color
                          : 'rgba(255,255,255,0.04)',
                      }}
                      aria-pressed={isActive}
                      aria-label={`Switch to ${agent.name}`}
                    >
                      <Icon className="w-3 h-3" />
                      {agent.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
