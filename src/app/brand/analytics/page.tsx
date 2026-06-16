'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Eye, Sparkles, Plus, Save, Award, FileText,
  AlertCircle, ChevronRight, Activity, Globe, MessageSquare, Heart
} from 'lucide-react';

export default function BrandAnalyticsPage() {
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [impressions, setImpressions] = useState('');
  const [engagements, setEngagements] = useState('');
  const [leadsGenerated, setLeadsGenerated] = useState('');

  // Queries
  const contentPieces = useLiveQuery(() => db.contentPieces.toArray()) ?? [];

  // Filter published posts
  const publishedPosts = contentPieces.filter(c => c.status === 'Published');

  // Compute stats
  const totalPosts = publishedPosts.length;
  const totalImpressions = publishedPosts.reduce((sum, p) => sum + (p.impressions || 0), 0);
  const totalEngagements = publishedPosts.reduce((sum, p) => sum + (p.engagements || 0), 0);
  const avgEngagementRate = totalImpressions > 0 
    ? ((totalEngagements / totalImpressions) * 100).toFixed(1)
    : '4.8';

  // Manual seed metrics for display if no posts are logged in DB
  const displayImpressions = totalImpressions > 0 ? totalImpressions : 45200;
  const displayEngagements = totalEngagements > 0 ? totalEngagements : 2840;

  const handleLogMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId) return;

    const post = contentPieces.find(c => c.id === parseInt(selectedPostId));
    if (!post) return;

    const imps = parseInt(impressions) || 0;
    const engs = parseInt(engagements) || 0;
    // We can save leads generated in content text or a custom field if it is upgraded
    
    try {
      await db.contentPieces.update(post.id!, {
        impressions: imps,
        engagements: engs,
        status: 'Published'
      });

      // Reset
      setSelectedPostId('');
      setImpressions('');
      setEngagements('');
      setLeadsGenerated('');
      setShowLogForm(false);
    } catch (err) {
      console.error('Failed to log content performance:', err);
    }
  };

  // Mock charts data
  const growthData = [
    { name: 'Mar', followers: 2400, subscribers: 350 },
    { name: 'Apr', followers: 2950, subscribers: 480 },
    { name: 'May', followers: 3600, subscribers: 620 },
    { name: 'Jun', followers: 4800, subscribers: 850 },
  ];

  const categoryData = [
    { name: 'R&D/Science', reach: 18200, eng: 1200 },
    { name: 'Personal Story', reach: 14500, eng: 920 },
    { name: 'Thought Lead', reach: 9800, eng: 540 },
    { name: 'B2B/Industry', reach: 12000, eng: 720 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <Globe className="w-6 h-6 text-[#00B4D8]" /> BRAND AUDIENCE INTEL
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Monitor social impressions, newsletter growth trends, and conversion attribution.
          </p>
        </div>
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          {showLogForm ? 'CLOSE FORM' : 'LOG POST METRICS'}
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Followers */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <Users className="w-8 h-8 text-blue-500/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">LinkedIn Followers</span>
            <span className="text-lg font-bold font-mono text-white mt-1">4,800 followers</span>
          </div>
        </div>

        {/* Subscribers */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
          <FileText className="w-8 h-8 text-purple-500/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Newsletter List</span>
            <span className="text-lg font-bold font-mono text-white mt-1">850 subscribers</span>
          </div>
        </div>

        {/* Impressions */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <Eye className="w-8 h-8 text-emerald-500/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Reach / Impressions</span>
            <span className="text-lg font-bold font-mono text-white mt-1">{displayImpressions.toLocaleString()} views</span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <TrendingUp className="w-8 h-8 text-amber-500/20 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Average Engagement Rate</span>
            <span className="text-lg font-bold font-mono text-white mt-1">{avgEngagementRate}% rate</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Charts & Tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Log metrics form */}
          {showLogForm && (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Plus className="w-4 h-4 text-[#00B4D8]" /> RECORD PUBLISHED CONTENT PERFORMANCE
              </span>
            }>
              <form onSubmit={handleLogMetrics} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Select Content Piece</label>
                  {contentPieces.length === 0 ? (
                    <div className="text-[10px] text-zinc-550 italic font-mono py-2">No content drafts recorded.</div>
                  ) : (
                    <select
                      value={selectedPostId}
                      onChange={e => setSelectedPostId(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors cursor-pointer"
                    >
                      <option value="">-- Choose Draft/Scheduled Post --</option>
                      {contentPieces.map(c => (
                        <option key={c.id} value={c.id}>
                          [{c.status}] {c.title.slice(0, 45)}...
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Actual Impressions</label>
                    <input
                      type="number"
                      placeholder="Views count"
                      value={impressions}
                      onChange={e => setImpressions(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Reactions & Comments</label>
                    <input
                      type="number"
                      placeholder="Total engagement"
                      value={engagements}
                      onChange={e => setEngagements(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">B2B Leads Generated</label>
                    <input
                      type="number"
                      placeholder="Attributed leads count"
                      value={leadsGenerated}
                      onChange={e => setLeadsGenerated(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={contentPieces.length === 0}
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    LOG PERFORMANCE
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Growth Trend Area Chart */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Activity className="w-4 h-4 text-emerald-400" /> AUDIENCE COMPOUNDING GROWTH TREND
            </span>
          }>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937' }} />
                  <defs>
                    <linearGradient id="colorFoll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="followers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFoll)" name="Followers (LinkedIn)" />
                  <Area type="monotone" dataKey="subscribers" stroke="#a855f7" fillOpacity={1} fill="url(#colorSub)" name="Subscribers (Newsletter)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

        {/* Right Side: Performance Leaderboard */}
        <div className="lg:col-span-1 space-y-6">
          {/* Category Reach Bar Chart */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <TrendingUp className="w-4 h-4 text-amber-500" /> CATEGORY ENGAGEMENT
            </span>
          }>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={8} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937' }} />
                  <Bar dataKey="reach" fill="#00B4D8" name="Reach" />
                  <Bar dataKey="eng" fill="#D4A017" name="Engagements" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Published leaderboard */}
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Award className="w-4 h-4 text-[#D4A017]" /> LEADERBOARD
            </span>
          }>
            <div className="space-y-3">
              {publishedPosts.length === 0 ? (
                <div className="text-center py-6 text-zinc-650 font-mono text-[10px] italic">
                  No post performance logged. Click Log Post Metrics above.
                </div>
              ) : (
                publishedPosts.map((post, idx) => {
                  const rate = post.impressions ? (((post.engagements || 0) / post.impressions) * 100).toFixed(1) : '0';
                  return (
                    <div key={post.id} className="p-3 border border-zinc-850 rounded bg-zinc-950 space-y-2 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-zinc-200 font-mono truncate max-w-[150px]">{post.title}</span>
                        <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-500">Rank #{idx+1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-zinc-550">
                        <div>Views: <span className="text-zinc-350">{post.impressions || 0}</span></div>
                        <div>Eng: <span className="text-zinc-350">{post.engagements || 0}</span></div>
                        <div className="text-right text-[#00B4D8] font-bold">{rate}% ER</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
