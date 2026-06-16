'use client';

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ContentPiece } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Plus, Sparkles, Calendar, TrendingUp, BarChart3, Edit2, 
  Trash2, Smile, Award, CheckCircle2, AlertTriangle, Eye, Send, BarChart
} from 'lucide-react';
import { Linkedin } from '@/components/icons/Linkedin';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_EMOJIS = ['🚀', '💡', '📊', '🧪', '🔬', '📈', '🥛', '🤝', '🧠', '🏢', '📅', '✍️', '🔥', '✅', '⚠️', '🔴', '🟡', '🟢', '🎯', '👑'];
const CATEGORIES = ['Educational', 'Personal Story', 'Product/Company', 'Industry Insight', 'Thought Leadership'];
const TONES = ['Professional', 'Personal', 'Educational', 'Inspirational'];

export default function LinkedInStudioPage() {
  const posts = useLiveQuery(() => 
    db.contentPieces.where('type').equals('LinkedIn').toArray()
  ) || [];

  // Post Composer States
  const [composerTitle, setComposerTitle] = useState('');
  const [composerContent, setComposerContent] = useState('');
  const [composerCategory, setComposerCategory] = useState('Educational');
  const [composerScheduleDate, setComposerScheduleDate] = useState('');
  const [composerStatus, setComposerStatus] = useState<ContentPiece['status']>('Draft');
  const [editId, setEditId] = useState<number | null>(null);

  // AI Assistant States
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [aiHooks, setAiHooks] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Performance log modal states
  const [performancePost, setPerformancePost] = useState<ContentPiece | null>(null);
  const [logImpressions, setLogImpressions] = useState('');
  const [logEngagements, setLogEngagements] = useState('');

  // Auto seed starter data to make charts look great initially
  React.useEffect(() => {
    const seedBrandData = async () => {
      const count = await db.contentPieces.where('type').equals('LinkedIn').count();
      if (count === 0) {
        const samplePosts = [
          { title: 'Carrageenan Gelation post', type: 'LinkedIn' as const, status: 'Published' as const, content: 'Kappa carrageenan is a miracle stabilizer. In water, it forms hard, rigid gels, but under calcium ions, we get a much softer elastic network. Here is how I optimized the blend in KAFS...', category: 'Educational', platform: 'LinkedIn', impressions: 4200, engagements: 340, createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
          { title: 'PhD Journey thoughts', type: 'LinkedIn' as const, status: 'Published' as const, content: 'Why I am building my own Operating System for my food technology research. Standard tools like Notion just did not cut it. KGOS integrates Dexie, canvas graphs, and custom models...', category: 'Personal Story', platform: 'LinkedIn', impressions: 7800, engagements: 810, createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
          { title: 'B2B Sales stabilizer post', type: 'LinkedIn' as const, status: 'Scheduled' as const, content: 'Commercial manufacturers are losing 12% yield due to cold pasteurization phase separations. Let us review the math of viscosity modeling...', category: 'Industry Insight', platform: 'LinkedIn', scheduledDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), createdAt: new Date().toISOString() }
        ];

        for (const p of samplePosts) {
          await db.contentPieces.add(p);
        }
      }
    };
    seedBrandData();
  }, []);

  // Form submit handler
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim()) return;

    const data: Omit<ContentPiece, 'id' | 'createdAt'> = {
      title: composerTitle || `LinkedIn Post - ${composerCategory}`,
      type: 'LinkedIn',
      status: composerScheduleDate ? 'Scheduled' : composerStatus,
      content: composerContent,
      tags: composerCategory,
      scheduledDate: composerScheduleDate || undefined,
      platform: 'LinkedIn'
    };

    if (editId !== null) {
      await db.contentPieces.update(editId, data);
      setEditId(null);
    } else {
      await db.contentPieces.add({ ...data, createdAt: new Date().toISOString() });
    }

    setComposerTitle('');
    setComposerContent('');
    setComposerCategory('Educational');
    setComposerScheduleDate('');
    setComposerStatus('Draft');
  };

  const handleEdit = (p: ContentPiece) => {
    setEditId(p.id!);
    setComposerTitle(p.title);
    setComposerContent(p.content || '');
    setComposerCategory(p.tags || 'Educational');
    setComposerScheduleDate(p.scheduledDate || '');
    setComposerStatus(p.status);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this post draft?')) {
      await db.contentPieces.delete(id);
    }
  };

  const handleLogPerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!performancePost) return;

    await db.contentPieces.update(performancePost.id!, {
      impressions: parseInt(logImpressions) || 0,
      engagements: parseInt(logEngagements) || 0,
      status: 'Published'
    });

    setPerformancePost(null);
    setLogImpressions('');
    setLogEngagements('');
  };

  // Emojis helper
  const insertEmoji = (emoji: string) => {
    setComposerContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // AI Helper: Generate Hooks
  const handleGenerateHooks = () => {
    if (!aiTopicInput.trim()) {
      alert('Provide a topic or keyword first.');
      return;
    }
    const templates = [
      `Question Hook: "Are you still using gelatin? Here's why seaweed carrageenan is taking over ${aiTopicInput}..."`,
      `Statistic Hook: "84% of food processors lose yield in pasteurization. Here is the math to solve ${aiTopicInput}..."`,
      `Story Hook: "My custom hydrocolloid formulation failed at 3:00 AM. It taught me this about ${aiTopicInput}..."`,
      `Controversial Hook: "Unpopular opinion: Stop relying on standard stabilizers. You need custom viscosity modeling for ${aiTopicInput}."`,
      `How-To Hook: "How to design heat-resistant protein matrices using ${aiTopicInput} in 5 steps..."`
    ];
    setAiHooks(templates);
  };

  // AI Helper: Expand Content
  const handleExpandContent = () => {
    if (!composerContent.trim()) {
      setComposerContent(`Viscoelastic properties in protein-stabilizer networks dictate commercial mouthfeel. When formulation batches cool, carrageenan forms rigid crystalline structures. Overcoming syneresis requires adjusting pH boundaries and potassium concentration levels. \n\nThrough KAFS simulations, we modeled cacao suspension velocity under rapid pasteurization cooling cycles, proving a 22% increase in yield stability.`);
    } else {
      setComposerContent(prev => prev + `\n\nThis macromolecular synergy is the foundation of Kumar Advanced Food Systems (KAFS). By modeling molecular alignments, we predict phase separation days before production begins.`);
    }
  };

  // AI Helper: Add Call to Action (CTA)
  const handleAddCTA = () => {
    setComposerContent(prev => prev + `\n\nFollow for weekly breakdowns of food engineering, hydrocolloids, and automation models. 🚀`);
  };

  // Content Calendar Strip calculations (Next 7 Days)
  const calendarPreview = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = posts.filter(p => p.scheduledDate && p.scheduledDate.startsWith(dateStr)).length;
      days.push({
        label: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
        count
      });
    }
    return days;
  }, [posts]);

  // Analytics sidebar calculations
  const totalDrafts = posts.filter(p => p.status === 'Draft').length;
  const totalScheduled = posts.filter(p => p.status === 'Scheduled').length;
  const totalPublished = posts.filter(p => p.status === 'Published').length;

  const avgImpressions = useMemo(() => {
    const pubWithImp = posts.filter(p => p.status === 'Published' && p.impressions && p.impressions > 0);
    if (pubWithImp.length === 0) return 0;
    return Math.round(pubWithImp.reduce((sum, p) => sum + (p.impressions || 0), 0) / pubWithImp.length);
  }, [posts]);

  const bestPost = useMemo(() => {
    const pubWithImp = posts.filter(p => p.status === 'Published' && p.impressions);
    if (pubWithImp.length === 0) return null;
    return pubWithImp.reduce((best, curr) => (curr.impressions || 0) > (best.impressions || 0) ? curr : best, pubWithImp[0]);
  }, [posts]);

  // Category breakdown for chart
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      const cat = p.tags || 'Educational';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [posts]);

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Brand Factory</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Linkedin className="w-8 h-8 text-[#00B4D8]" />
            LINKEDIN STUDIO
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Draft thought leadership posts, brainstorm hook ideas with AI templates, and track engagement trends.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Composer & AI Tools (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Post Composer Card */}
          <Card header={<span className="text-sm font-semibold text-slate-200">Post Creator Studio</span>}>
            <form onSubmit={handleSavePost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="Post Reference Title..."
                  value={composerTitle}
                  onChange={e => setComposerTitle(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-slate-700 outline-none"
                />
              </div>

              {/* Textarea Composer */}
              <div className="relative">
                <textarea
                  value={composerContent}
                  onChange={e => setComposerContent(e.target.value)}
                  maxLength={3000}
                  className="w-full h-64 bg-[#0B1220] border border-slate-800 rounded-lg p-4 text-xs text-slate-200 focus:border-slate-700 outline-none font-sans leading-relaxed resize-none"
                  placeholder="What is your scientific insight today? Write content here..."
                />
                
                {/* Character Counter & Emoji Toolbar */}
                <div className="absolute bottom-3 right-3 flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                  <span>{composerContent.length} / 3000</span>
                  
                  {/* Emoji Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1 hover:bg-slate-800 rounded text-[#D4A017] cursor-pointer"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute right-0 bottom-6 bg-[#0F172A] border border-slate-800 p-2.5 rounded-lg shadow-2xl z-50 grid grid-cols-5 gap-1.5 w-44">
                        {PLATFORM_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="text-base hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Category</label>
                  <select
                    value={composerCategory}
                    onChange={e => setComposerCategory(e.target.value)}
                    className="py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={composerScheduleDate}
                    onChange={e => setComposerScheduleDate(e.target.value)}
                    className="py-1.5 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold font-mono">Status (Draft Action)</label>
                  <select
                    value={composerStatus}
                    onChange={e => setComposerStatus(e.target.value as any)}
                    className="py-2 px-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
                  >
                    <option value="Draft">Draft Mode</option>
                    <option value="Review">Needs Review</option>
                    <option value="Scheduled">Scheduled Queue</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                {editId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setComposerTitle('');
                      setComposerContent('');
                      setComposerScheduleDate('');
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded font-semibold cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 btn-primary text-xs rounded-lg font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> {editId !== null ? 'Update Post' : 'Log Brand Asset'}
                </button>
              </div>
            </form>
          </Card>

          {/* AI Creative Assistant Section */}
          <Card header={<span className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#00B4D8]" /> AI Copywriting Toolkit (Simulated)</span>}>
            <div className="flex flex-col gap-4 text-xs">
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter hook topic (e.g. food stabilizers, raw seaweed cost model)..."
                  value={aiTopicInput}
                  onChange={e => setAiTopicInput(e.target.value)}
                  className="flex-1 bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-slate-700"
                />
                
                <button
                  onClick={handleGenerateHooks}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-3 py-2 rounded-lg font-semibold border border-slate-700 cursor-pointer"
                >
                  Hooks
                </button>
              </div>

              {/* Hook lists display */}
              {aiHooks.length > 0 && (
                <div className="bg-[#0b1220] border border-slate-850 p-4 rounded-xl flex flex-col gap-2 font-mono text-xs text-slate-300">
                  <span className="text-[9px] text-slate-500 uppercase block mb-1">Generated Hooks (Click to select & copy)</span>
                  {aiHooks.map((hook, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setComposerContent(prev => hook + '\n\n' + prev);
                        setAiHooks([]);
                      }}
                      className="p-2 border border-slate-900 rounded bg-[#0F172A]/50 hover:bg-[#1A2332]/40 hover:border-slate-800 cursor-pointer transition-all leading-relaxed"
                    >
                      {hook}
                    </div>
                  ))}
                </div>
              )}

              {/* Expansion actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <button
                  onClick={handleExpandContent}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 py-2 rounded font-semibold border border-slate-750 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Expand Content
                </button>
                <button
                  onClick={handleAddCTA}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 py-2 rounded font-semibold border border-slate-750 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Standard CTA
                </button>
                
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Tone:</span>
                  <select
                    value={selectedTone}
                    onChange={e => setSelectedTone(e.target.value)}
                    className="py-1 px-2 bg-[#0b1220] border border-slate-800 rounded text-[10px] text-slate-400 outline-none"
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Column: Analytics & Queue (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Calendar strip preview */}
          <Card header={<span className="text-sm font-semibold text-slate-200">Scheduled Strip (Next 7 Days)</span>}>
            <div className="flex justify-between gap-1.5">
              {calendarPreview.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center bg-[#0B1220]/60 p-2 border border-slate-850 rounded-lg">
                  <span className="text-[8px] font-mono text-slate-500 block text-center leading-none">{day.label.split(' ')[0]}</span>
                  <span className="text-[10px] font-bold text-slate-300 block text-center mt-1">{day.label.split(' ')[1]}</span>
                  <span className={`w-2 h-2 rounded-full mt-2 block ${
                    day.count > 0 ? 'bg-[#00B4D8] animate-pulse' : 'bg-slate-800'
                  }`} title={`${day.count} posts scheduled`} />
                </div>
              ))}
            </div>
          </Card>

          {/* Core Analytics Card */}
          <Card header={<span className="text-sm font-semibold text-slate-200">Asset Engagement Analytics</span>}>
            <div className="flex flex-col gap-4">
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#0B1220]/80 p-2 border border-slate-850 rounded">
                  <span className="text-[8px] text-slate-500 block uppercase">Drafts</span>
                  <span className="text-base font-bold text-slate-300">{totalDrafts}</span>
                </div>
                <div className="bg-[#0B1220]/80 p-2 border border-slate-850 rounded">
                  <span className="text-[8px] text-slate-500 block uppercase">Queued</span>
                  <span className="text-base font-bold text-[#00B4D8]">{totalScheduled}</span>
                </div>
                <div className="bg-[#0B1220]/80 p-2 border border-slate-850 rounded">
                  <span className="text-[8px] text-slate-500 block uppercase">Posted</span>
                  <span className="text-base font-bold text-emerald-400">{totalPublished}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-850 pb-2.5">
                <span className="text-slate-400">Average Impressions:</span>
                <span className="font-mono font-bold text-[#D4A017]">{avgImpressions.toLocaleString()}</span>
              </div>

              {bestPost && (
                <div className="flex flex-col gap-1 border-b border-slate-850 pb-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Best Performing Post</span>
                  <span className="text-xs font-serif font-bold text-slate-200 line-clamp-1">{bestPost.content}</span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5">★ {bestPost.impressions} Impressions</span>
                </div>
              )}

              {/* Categories distribution bar chart */}
              {categoryChartData.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Categories Distribution</span>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={categoryChartData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 8 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 8 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #1e293b', borderRadius: 8, fontSize: 10 }} />
                        <Bar dataKey="value" fill="#00B4D8" radius={[2, 2, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* Post History Deck List */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-200">Log History Registry</span>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
              {posts.map(p => (
                <div key={p.id} className="bg-[#0F172A] border border-slate-850 hover:border-slate-800 p-3 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-slate-900 border border-slate-850 text-slate-400">
                      {p.tags || 'General'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${
                      p.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {p.content}
                  </p>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-850/50 pt-2 mt-1">
                    <span>
                      {p.status === 'Scheduled' && p.scheduledDate 
                        ? `Sched: ${p.scheduledDate.replace('T', ' ')}` 
                        : `Created: ${new Date(p.createdAt).toLocaleDateString()}`}
                    </span>
                    
                    <div className="flex gap-2">
                      {p.status === 'Published' ? (
                        <button
                          onClick={() => {
                            setPerformancePost(p);
                            setLogImpressions(p.impressions?.toString() || '');
                            setLogEngagements(p.engagements?.toString() || '');
                          }}
                          className="text-[#D4A017] hover:underline"
                        >
                          Log Stats
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            // Publish immediately
                            db.contentPieces.update(p.id!, { status: 'Published', publishedDate: new Date().toISOString() });
                          }}
                          className="text-emerald-400 hover:underline"
                        >
                          Publish Now
                        </button>
                      )}
                      <button onClick={() => handleEdit(p)} className="text-[#00B4D8] hover:underline">Edit</button>
                      <button onClick={() => handleDelete(p.id!)} className="text-rose-400 hover:underline">Delete</button>
                    </div>
                  </div>

                  {/* performance display */}
                  {p.status === 'Published' && p.impressions !== undefined && (
                    <div className="flex justify-between text-[9px] font-mono text-slate-400 bg-slate-950/40 p-1 rounded px-2 mt-1 border border-slate-900">
                      <span>Impressions: {p.impressions}</span>
                      <span>Engagements: {p.engagements}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {posts.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">No posts drafts registered.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* PERFORMANCE METRICS INPUT DIALOG */}
      {performancePost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">Log Engagement Performance</h3>
              <button onClick={() => setPerformancePost(null)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleLogPerformanceSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Actual Impressions</label>
                <input
                  type="number"
                  placeholder="e.g. 5200"
                  value={logImpressions}
                  onChange={e => setLogImpressions(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold font-mono">Actual Engagements</label>
                <input
                  type="number"
                  placeholder="e.g. 480"
                  value={logEngagements}
                  onChange={e => setLogEngagements(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setPerformancePost(null)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Log Stats
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
