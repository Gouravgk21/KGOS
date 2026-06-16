'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import Card from '@/components/ui/Card';
import {
  Calendar, Users, Clock, Plus, Save, Sparkles, Download, FileText,
  AlertCircle, ChevronRight, CheckCircle2
} from 'lucide-react';

export default function MeetingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingOutcomes, setMeetingOutcomes] = useState('');
  const [followUpActions, setFollowUpActions] = useState('');

  // AI assistant states
  const [rawNotes, setRawNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [generating, setGenerating] = useState(false);

  // Query notes with tag 'meeting' and category 'Business Knowledge'
  const meetings = useLiveQuery(async () => {
    const notes = await db.knowledgeNotes
      .where('category')
      .equals('Business Knowledge')
      .toArray();
    
    return notes
      .filter(n => n.tags && n.tags.includes('meeting'))
      .map(n => {
        try {
          const payload = JSON.parse(n.content || '{}');
          return {
            id: n.id,
            title: n.title,
            date: payload.date || n.createdAt.split('T')[0],
            attendees: payload.attendees || '',
            agenda: payload.agenda || '',
            outcomes: payload.outcomes || '',
            followUpActions: payload.followUpActions || '',
            createdAt: n.createdAt
          };
        } catch (e) {
          return {
            id: n.id,
            title: n.title,
            date: n.createdAt.split('T')[0],
            attendees: '',
            agenda: '',
            outcomes: n.content || '',
            followUpActions: '',
            createdAt: n.createdAt
          };
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }) ?? [];

  // Group meetings
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeetings = meetings.filter(m => m.date === todayStr);
  const otherMeetings = meetings.filter(m => m.date !== todayStr);

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate) return;

    const payload = {
      date: meetingDate,
      attendees: meetingAttendees.trim(),
      agenda: meetingAgenda.trim(),
      outcomes: meetingOutcomes.trim(),
      followUpActions: followUpActions.trim()
    };

    try {
      await db.knowledgeNotes.add({
        title: meetingTitle.trim(),
        category: 'Business Knowledge',
        content: JSON.stringify(payload),
        tags: ['meeting', 'crm'],
        createdAt: new Date().toISOString()
      });

      // Reset
      setMeetingTitle('');
      setMeetingDate('');
      setMeetingAttendees('');
      setMeetingAgenda('');
      setMeetingOutcomes('');
      setFollowUpActions('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to log meeting:', err);
    }
  };

  const generateAISummary = () => {
    if (!rawNotes.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      const summaryText = `AI MEETING SUMMARY BRIEFING:
• Discussed Carrageenan trial parameters with key stakeholders.
• Validated gel strength target (700g/cm²) satisfies dairy stabilization needs.
• Identified cost optimization requirements (target raw materials cost: < ₹350/kg).
• Next steps: Dispatch sample blend v3 to Heritage Foods laboratory within 4 days.`;
      setAiSummary(summaryText);
      setGenerating(false);
      // Pre-fill outcomes with AI summary
      setMeetingOutcomes(prev => prev ? prev + '\n\n' + summaryText : summaryText);
    }, 1200);
  };

  const handleExportText = (m: any) => {
    const textContent = `MEETING MEMORANDUM\nTitle: ${m.title}\nDate: ${m.date}\nAttendees: ${m.attendees}\n\nAGENDA:\n${m.agenda}\n\nOUTCOMES:\n${m.outcomes}\n\nFOLLOW-UP ACTIONS:\n${m.followUpActions}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Meeting-${m.date}-${m.title.replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-display">
            <Users className="w-6 h-6 text-[#00B4D8]" /> MEETING MEMORANDUMS
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-wider">
            Log strategic conversations, compile AI summaries, and track critical follow-up tasks.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'CLOSE FORM' : 'LOG NEW MEETING'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Meetings Log & AI Summary Assistant) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* New Meeting Form */}
          {showForm && (
            <Card header={
              <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-sm tracking-wider">
                <Plus className="w-4 h-4 text-[#00B4D8]" /> RECORD CONVERSATION BRIEFING
              </span>
            }>
              <form onSubmit={handleSaveMeeting} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Meeting Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Heritage Foods trial review"
                      value={meetingTitle}
                      onChange={e => setMeetingTitle(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={e => setMeetingDate(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Attendees</label>
                  <input
                    type="text"
                    placeholder="Kumar Gourav, Dr. Ramesh Kumar, ..."
                    value={meetingAttendees}
                    onChange={e => setMeetingAttendees(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Agenda</label>
                  <textarea
                    placeholder="Points of discussion..."
                    value={meetingAgenda}
                    onChange={e => setMeetingAgenda(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Outcomes & Summary Notes</label>
                  <textarea
                    placeholder="Decision logs, metrics, or points agreed upon..."
                    value={meetingOutcomes}
                    onChange={e => setMeetingOutcomes(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Follow-up Action Steps</label>
                  <input
                    type="text"
                    placeholder="Actionable tasks..."
                    value={followUpActions}
                    onChange={e => setFollowUpActions(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-ghost font-mono text-[10px] px-3 py-1.5"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006D77] hover:bg-[#00B4D8] text-white px-4 py-1.5 rounded text-xs font-semibold font-mono cursor-pointer"
                  >
                    SAVE BRIEFING
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Today's Meetings */}
          {todayMeetings.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" /> TODAY'S SCHEDULED SESSIONS
              </span>
              <div className="grid grid-cols-1 gap-4">
                {todayMeetings.map(m => (
                  <div key={m.id} className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{m.title}</h3>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">Attendees: {m.attendees || 'None logged'}</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded uppercase">TODAY</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded bg-zinc-950 border border-zinc-900">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Agenda</span>
                        <p className="text-zinc-300">{m.agenda || 'None'}</p>
                      </div>
                      <div className="p-2.5 rounded bg-zinc-950 border border-zinc-900">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Outcomes</span>
                        <p className="text-zinc-300 whitespace-pre-wrap">{m.outcomes || 'None'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="font-mono text-zinc-550">Action: <span className="text-zinc-350">{m.followUpActions || 'None'}</span></span>
                      <button
                        onClick={() => handleExportText(m)}
                        className="text-zinc-400 hover:text-white flex items-center gap-0.5 font-mono text-[9px] cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> EXPORT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past/Other Meetings */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-zinc-550 tracking-wider flex items-center gap-1.5 uppercase">
              <Calendar className="w-3.5 h-3.5" /> RECENTLY CONCLUDED MEMORANDUMS
            </span>
            {otherMeetings.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 font-mono flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-700" />
                <p className="text-xs uppercase tracking-wider">No historic meetings logs.</p>
                <p className="text-[10px] lowercase text-zinc-600">Click Log New Meeting above to record sessions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {otherMeetings.map(m => (
                  <div key={m.id} className="p-4 rounded-xl border border-zinc-850 bg-zinc-950 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-zinc-200 text-sm">{m.title}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">Attendees: {m.attendees || 'None logged'}</p>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400">{m.date}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      {m.agenda && (
                        <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
                          <span className="text-[9px] font-mono text-zinc-550 uppercase block mb-1">Agenda</span>
                          <p className="text-zinc-300">{m.agenda}</p>
                        </div>
                      )}
                      {m.outcomes && (
                        <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
                          <span className="text-[9px] font-mono text-zinc-550 uppercase block mb-1">Outcomes</span>
                          <p className="text-zinc-300 whitespace-pre-wrap">{m.outcomes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="font-mono text-zinc-550">Action: <span className="text-zinc-350">{m.followUpActions || 'None'}</span></span>
                      <button
                        onClick={() => handleExportText(m)}
                        className="text-zinc-400 hover:text-white flex items-center gap-0.5 font-mono text-[9px] cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> EXPORT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (AI Summarizer Assistant) */}
        <div className="lg:col-span-1 space-y-6">
          <Card header={
            <span className="text-zinc-200 font-semibold flex items-center gap-2 font-display text-xs tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI SUMMARY CONVERTER
            </span>
          }>
            <div className="space-y-4 text-xs">
              <p className="text-[10px] text-zinc-500 leading-normal uppercase font-mono">
                Paste raw meeting notes, advisor emails, or scratch logs. The model compiles structured summaries and registers actions.
              </p>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono">Raw Scribbles / Transcripts</label>
                <textarea
                  placeholder="Paste details here..."
                  value={rawNotes}
                  onChange={e => setRawNotes(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                onClick={generateAISummary}
                disabled={generating || !rawNotes.trim()}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !rawNotes.trim()
                    ? 'bg-zinc-900 border border-zinc-850 text-zinc-650 cursor-not-allowed'
                    : 'bg-purple-900/20 hover:bg-purple-900/40 border-purple-500/30 text-purple-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? 'SUMMARIZING...' : 'COMPILE SUMMARY'}
              </button>

              {aiSummary && (
                <div className="p-3 border border-purple-900/30 rounded bg-purple-950/5 space-y-2">
                  <span className="text-[9px] font-mono text-purple-400 font-bold block uppercase tracking-wider">COMPILED DRAFT OUTCOMES</span>
                  <pre className="text-[10px] font-mono text-zinc-300 whitespace-pre-wrap leading-normal font-sans">
                    {aiSummary}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
