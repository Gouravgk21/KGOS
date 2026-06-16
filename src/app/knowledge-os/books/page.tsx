'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type KnowledgeNote } from '@/db/database';
import Card from '@/components/ui/Card';
import { 
  BookOpen, Plus, Search, Star, Trash2, Edit2, Sparkles, Brain, CheckCircle2,
  Hourglass, FileText, ArrowRight, BarChart2
} from 'lucide-react';

export default function BooksPage() {
  const notes = useLiveQuery(() => 
    db.knowledgeNotes.toArray()
  ) || [];

  // Filter books (tagged with 'book')
  const books = notes.filter(n => n.tags && n.tags.includes('book'));

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookProgress, setBookProgress] = useState(0);
  const [bookStatus, setBookStatus] = useState<'To Read' | 'Reading' | 'Finished'>('To Read');
  const [bookRating, setBookRating] = useState(5);
  const [bookNotesText, setBookNotesText] = useState('');

  // Selected book detail view
  const [selectedBook, setSelectedBook] = useState<KnowledgeNote | null>(null);
  const [aiInsights, setAiInsights] = useState('');

  // Auto populate mock books
  React.useEffect(() => {
    const seedBooksData = async () => {
      const count = notes.filter(n => n.tags && n.tags.includes('book')).length;
      if (count === 0) {
        const sampleBooks = [
          { title: 'Food Hydrocolloids: Structures & Properties', tags: ['book', 'science'], category: 'Notes' as const, content: JSON.stringify({ author: 'K. Nishinari', progress: 65, status: 'Reading', rating: 5, notes: 'Detailing polysaccharide structures, gelation mechanisms, and molecular weight distributions of seaweed gum extracts.', highlights: '• Carrageenan gelation occurs through coil-helix transitions.\n• Divalent ions shield charge repulsions to strengthen gels.\n• Synergy of galactans with galactomannans.' }), createdAt: new Date().toISOString() },
          { title: 'Building a Second Brain', tags: ['book', 'productivity'], category: 'Notes' as const, content: JSON.stringify({ author: 'Tiago Forte', progress: 100, status: 'Finished', rating: 5, notes: 'CODE framework: Capture, Organize, Distill, Express. Emphasizes externalizing knowledge to free cognitive space.', highlights: '• Your brain is for having ideas, not holding them.\n• Capture details that resonate, organize by actionability (PARA).\n• Bidirectional links create neural pathways.' }), createdAt: new Date().toISOString() },
          { title: 'Atomic Habits', tags: ['book', 'productivity'], category: 'Notes' as const, content: JSON.stringify({ author: 'James Clear', progress: 20, status: 'Reading', rating: 4, notes: 'Focuses on 1% daily compounding increments. Identity-based habits are more resilient than goal-based habits.', highlights: '• Small habits accumulate into massive life changes.\n• Make it obvious, attractive, easy, and satisfying.' }), createdAt: new Date().toISOString() }
        ];

        for (const b of sampleBooks) {
          await db.knowledgeNotes.add(b);
        }
      }
    };
    seedBooksData();
  }, [notes]);

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    const contentData = {
      author: bookAuthor,
      progress: bookProgress,
      status: bookStatus,
      rating: bookRating,
      notes: bookNotesText,
      highlights: selectedBook ? JSON.parse(selectedBook.content || '{}').highlights || '' : ''
    };

    const noteData = {
      title: bookTitle,
      category: 'Notes' as const,
      tags: ['book'],
      content: JSON.stringify(contentData),
      createdAt: new Date().toISOString()
    };

    if (editId !== null) {
      // Preserve highlights
      const existing = await db.knowledgeNotes.get(editId);
      try {
        const existingContent = JSON.parse(existing?.content || '{}');
        contentData.highlights = existingContent.highlights || '';
      } catch {}

      await db.knowledgeNotes.update(editId, {
        title: bookTitle,
        content: JSON.stringify(contentData)
      });
      setEditId(null);
    } else {
      await db.knowledgeNotes.add(noteData);
    }

    setBookTitle('');
    setBookAuthor('');
    setBookProgress(0);
    setBookStatus('To Read');
    setBookRating(5);
    setBookNotesText('');
    setIsModalOpen(false);
  };

  const handleEdit = (note: KnowledgeNote) => {
    if (note.id === undefined) return;
    try {
      const data = JSON.parse(note.content || '{}');
      setEditId(note.id);
      setBookTitle(note.title);
      setBookAuthor(data.author || '');
      setBookProgress(data.progress || 0);
      setBookStatus(data.status || 'To Read');
      setBookRating(data.rating || 5);
      setBookNotesText(data.notes || '');
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this book entry from vault?')) {
      await db.knowledgeNotes.delete(id);
      if (selectedBook?.id === id) setSelectedBook(null);
    }
  };

  // Simulated AI Highlights Extractor
  const handleExtractHighlights = async (id: number) => {
    const bookNote = await db.knowledgeNotes.get(id);
    if (!bookNote) return;

    try {
      const data = JSON.parse(bookNote.content || '{}');
      const text = data.notes || '';
      if (!text.trim()) {
        alert('Please write book notes/summaries first to extract key insights.');
        return;
      }

      // Simulation parser: split sentences, make bullets
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const bullets = sentences.slice(0, 3).map((s: string) => `• ${s.trim()}`).join('\n');
      
      const generatedHighlights = `KEY INSIGHTS (AI EXTRACTED):\n${bullets}\n\nRELEVANCE MATRIX:\n• Integrates with concepts in your Knowledge Graph.\n• Syncs structural ideas into your active research journals.`;

      data.highlights = generatedHighlights;
      await db.knowledgeNotes.update(id, { content: JSON.stringify(data) });

      // Refresh selection
      const updated = await db.knowledgeNotes.get(id);
      if (updated) {
        setSelectedBook(updated);
        setAiInsights(generatedHighlights);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page flex flex-col gap-6 p-6 bg-[#0B1220] min-h-screen text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00B4D8]">Second Brain Literature</span>
          <h1 className="text-3xl font-bold font-serif text-slate-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#00B4D8]" />
            READING LOGS & BOOKS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build your private digital library. Capture book chapters, review progress metrics, and extract insights.
          </p>
        </div>

        <button
          onClick={() => { setEditId(null); setIsModalOpen(true); }}
          className="btn-primary text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Book Cards List (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map(book => {
              let data = { author: '', progress: 0, status: 'To Read', rating: 5, notes: '', highlights: '' };
              try { data = JSON.parse(book.content || '{}'); } catch {}

              const isSelected = selectedBook?.id === book.id;

              return (
                <div 
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setAiInsights(data.highlights || '');
                  }}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-4 h-[180px] ${
                    isSelected 
                      ? 'bg-slate-900 border-[#00B4D8]/30 shadow-md' 
                      : 'bg-[#0F172A] border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold font-serif text-slate-100 leading-snug line-clamp-2 flex-1">{book.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider ${
                        data.status === 'Finished' ? 'bg-emerald-500/10 text-emerald-400' :
                        data.status === 'Reading' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {data.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">By: {data.author || 'Unknown Author'}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Progress</span>
                      <span>{data.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#006D77] to-[#00B4D8]"
                        style={{ width: `${data.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Rating footer */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-850/50 pt-2">
                    <div className="flex gap-0.5 text-[#D4A017]">
                      {Array.from({ length: data.rating || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-[#D4A017] stroke-none" />
                      ))}
                    </div>
                    <span>Added: {new Date(book.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {books.length === 0 && (
              <div className="col-span-full py-16 text-center border border-slate-850 rounded-2xl bg-[#0F172A]">
                No books registered. Click "Add Book" to catalog your reading library.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Book Detail Panel (1/3 width) */}
        <div className="lg:col-span-1">
          {selectedBook ? (() => {
            let data = { author: '', progress: 0, status: 'To Read', rating: 5, notes: '', highlights: '' };
            try { data = JSON.parse(selectedBook.content || '{}'); } catch {}

            return (
              <Card header={
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-serif font-bold text-slate-100 truncate max-w-[180px]">{selectedBook.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">Details</span>
                </div>
              }>
                <div className="flex flex-col gap-4 text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Author</span>
                    <span className="text-slate-300 block font-semibold">{data.author || 'Unknown'}</span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Notes & Summaries</span>
                    <p className="bg-[#0B1220] border border-slate-850 p-2.5 rounded-lg text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-[140px] overflow-y-auto scrollbar-thin">
                      {data.notes || 'No notes created.'}
                    </p>
                  </div>

                  {/* Highlights section */}
                  {data.highlights ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Highlights & Insights</span>
                      <div className="bg-[#1A2332]/50 border border-[#00B4D8]/20 p-3 rounded-lg text-[#00B4D8] font-mono whitespace-pre-line leading-relaxed">
                        {data.highlights}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleExtractHighlights(selectedBook.id!)}
                      className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 py-2 rounded-lg font-mono text-[10px] text-slate-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00B4D8]" /> Extract Insights with AI
                    </button>
                  )}

                  <div className="flex gap-2 border-t border-slate-850 pt-3.5">
                    <button
                      onClick={() => handleEdit(selectedBook)}
                      className="flex-1 border border-[#00B4D8]/20 bg-[#00B4D8]/5 hover:bg-[#00B4D8]/10 text-slate-200 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Edit Progress
                    </button>
                    <button
                      onClick={() => handleDelete(selectedBook.id!)}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-red-400 py-1.5 rounded-lg font-semibold text-xs border border-rose-500/20 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            );
          })() : (
            <div className="h-[250px] border border-dashed border-slate-800 rounded-2xl bg-[#0F172A] flex items-center justify-center p-6 text-center text-slate-500 text-xs font-mono">
              Select a book card to review summaries and extract insights.
            </div>
          )}
        </div>

      </div>

      {/* ADD/EDIT BOOK DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-200">
                {editId !== null ? 'Modify Book Entry' : 'Catalog Book in Vault'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveBook} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Book Title</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={e => setBookTitle(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  placeholder="e.g. Food Colloids"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Author</label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={e => setBookAuthor(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                  placeholder="e.g. Eric Dickinson"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium font-mono">Reading Status</label>
                  <select
                    value={bookStatus}
                    onChange={e => setBookStatus(e.target.value as any)}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-350 outline-none"
                  >
                    <option value="To Read">To Read</option>
                    <option value="Reading">Currently Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium font-mono">Rating (1-5 Stars)</label>
                  <select
                    value={bookRating}
                    onChange={e => setBookRating(parseInt(e.target.value))}
                    className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-350 outline-none"
                  >
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={bookProgress}
                  onChange={e => setBookProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-slate-700 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium font-mono">Syllabus / Chapter Notes</label>
                <textarea
                  value={bookNotesText}
                  onChange={e => setBookNotesText(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 h-24 text-xs text-slate-200 focus:border-slate-700 outline-none resize-none leading-relaxed font-mono"
                  placeholder="Summarize key chapters, quotes or paste snippets here..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-400 text-xs rounded cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary text-xs rounded cursor-pointer">
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
