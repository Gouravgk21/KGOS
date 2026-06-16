'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type KnowledgeNote } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  Search, Plus, Brain, Tag, Sparkles, BookOpen, Trash2, Edit2, 
  Bold, Italic, Heading1, Heading2, List, Eye, Code, ArrowRight
} from 'lucide-react';

const CATEGORIES: KnowledgeNote['category'][] = [
  'Notes',
  'Research',
  'Business Knowledge',
  'Ideas',
  'Government Exams',
  'Career'
];

export default function NotesPage() {
  const notes = useLiveQuery(() => db.knowledgeNotes.toArray()) || [];

  // Left Panel states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeNote['category'] | 'All'>('All');
  const [selectedNote, setSelectedNote] = useState<KnowledgeNote | null>(null);

  // Editor states
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCategory, setEditorCategory] = useState<KnowledgeNote['category']>('Notes');
  const [editorTags, setEditorTags] = useState('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');

  // AI helper states
  const [aiSummary, setAiSummary] = useState('');
  const [relatedTagFilter, setRelatedTagFilter] = useState<string | null>(null);

  // Auto-complete note titles for linking
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false);

  // Load selected note into editor
  useEffect(() => {
    if (selectedNote) {
      setEditorTitle(selectedNote.title);
      setEditorContent(selectedNote.content || '');
      setEditorCategory(selectedNote.category);
      setEditorTags(selectedNote.tags.join(', '));
      setAiSummary('');
    } else {
      setEditorTitle('');
      setEditorContent('');
      setEditorCategory('Notes');
      setEditorTags('');
      setAiSummary('');
    }
  }, [selectedNote]);

  // Debounced auto-save
  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(async () => {
      // Save changes if they differ
      if (
        editorTitle !== selectedNote.title ||
        editorContent !== (selectedNote.content || '') ||
        editorCategory !== selectedNote.category ||
        editorTags !== selectedNote.tags.join(', ')
      ) {
        const tagsArray = editorTags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

        await db.knowledgeNotes.update(selectedNote.id!, {
          title: editorTitle,
          content: editorContent,
          category: editorCategory,
          tags: tagsArray
        });

        // Update active reference locally
        setSelectedNote(prev => prev ? {
          ...prev,
          title: editorTitle,
          content: editorContent,
          category: editorCategory,
          tags: tagsArray
        } : null);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [editorTitle, editorContent, editorCategory, editorTags, selectedNote]);

  const handleCreateNewNote = async () => {
    const newNote: Omit<KnowledgeNote, 'id'> = {
      title: 'Untitled Note',
      content: '',
      category: 'Notes',
      tags: [],
      createdAt: new Date().toISOString()
    };

    const newId = await db.knowledgeNotes.add(newNote);
    const created = await db.knowledgeNotes.get(newId);
    if (created) setSelectedNote(created);
    setEditorMode('edit');
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm('Delete this note permanently?')) {
      await db.knowledgeNotes.delete(id);
      setSelectedNote(null);
    }
  };

  // Editor formatting action helpers
  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    setEditorContent(text.substring(0, start) + replacement + text.substring(end));
    
    // Reset cursor focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleLinkSelect = (noteTitle: string) => {
    insertText(`[[${noteTitle}]]`);
    setShowLinkSuggestions(false);
    setLinkSearchQuery('');
  };

  const handleSummarize = () => {
    if (!editorContent.trim()) {
      setAiSummary('Write some content first to generate a summary.');
      return;
    }
    // Simulated AI Summary
    const sentences = editorContent.match(/[^.!?]+[.!?]+/g) || [editorContent];
    const bullets = sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');
    setAiSummary(`AI SUMMARY (SIMULATED):\n${bullets}\n\nSuggested Tag Clusters:\n#${editorCategory.toLowerCase().replace(/\s+/g, '-')}, #kafs-vault`);
  };

  // Bidirectional link parser for preview tab
  const renderPreviewContent = (text: string) => {
    if (!text) return <p className="text-slate-500 italic">Empty note. Start writing...</p>;

    // Regex to match [[Note Title]]
    const parts = text.split(/(\[\[.*?\]\])/g);

    return (
      <div className="space-y-4 text-sm leading-relaxed text-slate-300 font-sans whitespace-pre-wrap">
        <p>
          {parts.map((part, index) => {
            if (part.startsWith('[[') && part.endsWith(']]')) {
              const targetTitle = part.slice(2, -2);
              const targetNote = notes.find(n => n.title.toLowerCase() === targetTitle.toLowerCase());

              if (targetNote) {
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedNote(targetNote)}
                    className="mx-1 px-1.5 py-0.5 rounded bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 border border-[#00B4D8]/20 text-[#00B4D8] font-mono text-xs cursor-pointer inline-flex items-center gap-1 font-bold"
                  >
                    <BookOpen className="w-3 h-3" /> {targetTitle}
                  </button>
                );
              } else {
                return (
                  <span
                    key={index}
                    className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono text-xs border border-slate-700 cursor-not-allowed inline-flex items-center gap-1"
                    title="Note does not exist yet"
                  >
                    {targetTitle} (Uncreated)
                  </span>
                );
              }
            }
            return part;
          })}
        </p>
      </div>
    );
  };

  // Tag overlap filter
  const handleFindRelated = () => {
    if (!selectedNote || selectedNote.tags.length === 0) {
      alert('This note needs tags to locate related entries.');
      return;
    }
    setRelatedTagFilter(selectedNote.tags[0]);
  };

  // Filter note list
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    
    // Tag overlap filter
    const matchesRelatedTag = !relatedTagFilter || n.tags.includes(relatedTagFilter);

    return matchesSearch && matchesCategory && matchesRelatedTag;
  });

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Obsidian Core</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#00B4D8]" />
            SECOND BRAIN NOTES
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Interconnected wiki-style notepad. Link nodes using wiki-brackets e.g. [[Note Title]].
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="btn-primary text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column: Notes Directory (3/10 width) */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-850 h-[650px]">
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Vault Files</h3>
              {relatedTagFilter && (
                <button
                  onClick={() => setRelatedTagFilter(null)}
                  className="text-[9px] text-[#00B4D8] hover:underline cursor-pointer"
                >
                  Clear Related
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-slate-700 font-mono"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="w-full py-1.5 px-2.5 bg-[#0B1220] border border-slate-800 rounded-lg text-xs outline-none text-slate-300 focus:border-slate-700"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-thin pr-1">
            {filteredNotes.map(n => {
              const isSelected = selectedNote?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => { setSelectedNote(n); setEditorMode('edit'); }}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'bg-slate-900 border-[#00B4D8]/30 shadow-md' 
                      : 'bg-[#0B1220]/60 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold font-serif text-slate-100 truncate flex-1">{n.title}</span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase flex-shrink-0">{n.category}</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {n.content || <em className="text-slate-600">No content</em>}
                  </p>

                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-850/30 pt-1.5">
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {n.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="bg-slate-800 px-1 rounded text-slate-400 text-[8px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-16 text-slate-500 text-xs">No notes matching query found.</div>
            )}
          </div>
        </div>

        {/* Right Column: Editor Workspace (7/10 width) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0F172A] p-5 rounded-2xl border border-slate-850 h-[650px]">
          {selectedNote ? (
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Header Details */}
              <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center border-b border-slate-850 pb-3">
                <div className="flex-1 flex flex-col gap-1.5 w-full">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={e => setEditorTitle(e.target.value)}
                    className="bg-transparent text-lg font-bold font-serif text-slate-100 border-b border-transparent hover:border-slate-800 focus:border-slate-700 outline-none w-full"
                    placeholder="Enter Note Title..."
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={editorCategory}
                      onChange={e => setEditorCategory(e.target.value as any)}
                      className="py-1 px-2 bg-[#0B1220] border border-slate-800 rounded text-[10px] text-slate-300 focus:border-slate-700 outline-none font-mono uppercase font-bold"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={editorTags}
                        onChange={e => setEditorTags(e.target.value)}
                        placeholder="tags, separated, by, commas"
                        className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-slate-750 text-[10px] text-slate-400 outline-none py-0.5 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Edit / Preview toggles */}
                <div className="flex bg-[#0B1220] border border-slate-800 rounded-lg p-0.5 self-end md:self-auto">
                  <button
                    onClick={() => setEditorMode('edit')}
                    className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                      editorMode === 'edit' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                      editorMode === 'preview' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-350'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Formatting and suggestions bar (only in Edit mode) */}
              {editorMode === 'edit' && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1220] p-2 border border-slate-850 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => insertText('**', '**')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertText('*', '*')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertText('# ')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Heading 1"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertText('## ')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Heading 2"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => insertText('- ')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="w-px h-4 bg-slate-800 mx-1" />

                    {/* Wiki linking shortcut button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLinkSuggestions(!showLinkSuggestions)}
                        className="px-2 py-1 hover:bg-slate-800 rounded text-[#00B4D8] font-mono text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                        title="Link to another note"
                      >
                        [[Link]]
                      </button>

                      {showLinkSuggestions && (
                        <div className="absolute left-0 top-7 w-48 bg-[#0F172A] border border-slate-800 shadow-2xl rounded-lg p-2 z-50 flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder="Find note..."
                            value={linkSearchQuery}
                            onChange={e => setLinkSearchQuery(e.target.value)}
                            className="w-full bg-[#0B1220] border border-slate-800 rounded p-1 text-[10px] text-slate-200"
                          />
                          <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1">
                            {notes
                              .filter(n => n.id !== selectedNote.id && n.title.toLowerCase().includes(linkSearchQuery.toLowerCase()))
                              .map(n => (
                                <button
                                  key={n.id}
                                  type="button"
                                  onClick={() => handleLinkSelect(n.title)}
                                  className="w-full text-left text-[10px] hover:bg-slate-800 p-1 rounded text-slate-300 truncate"
                                >
                                  {n.title}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Quick actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSummarize}
                      className="px-2 py-1 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 border border-[#00B4D8]/20 text-[#00B4D8] rounded font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Summarize
                    </button>
                    <button
                      onClick={handleFindRelated}
                      className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Brain className="w-3 h-3" /> Related
                    </button>
                  </div>
                </div>
              )}

              {/* Note Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
                {editorMode === 'edit' ? (
                  <textarea
                    id="note-textarea"
                    value={editorContent}
                    onChange={e => setEditorContent(e.target.value)}
                    className="flex-1 w-full bg-[#0B1220]/50 border border-slate-850 p-4 rounded-xl text-slate-200 text-xs outline-none focus:border-slate-800 resize-none font-mono leading-relaxed overflow-y-auto"
                    placeholder="Start typing notes. Use [[Note Title]] to link other nodes..."
                  />
                ) : (
                  <div className="flex-1 w-full bg-[#0B1220]/30 border border-slate-850 p-4 rounded-xl overflow-y-auto">
                    {renderPreviewContent(editorContent)}
                  </div>
                )}
              </div>

              {/* AI summary results panel */}
              {aiSummary && (
                <div className="bg-[#1A2332]/50 border border-[#00B4D8]/20 p-4 rounded-xl text-xs font-mono text-[#00B4D8] whitespace-pre-line relative">
                  <button 
                    onClick={() => setAiSummary('')} 
                    className="absolute top-2 right-3 text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                  {aiSummary}
                </div>
              )}

              {/* Footer detail */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3">
                <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id!)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Note
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <Brain className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-slate-400 font-serif font-bold text-base">No active note selected</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                Click a note from the left registry panel or click "New Note" to capture your thoughts.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
