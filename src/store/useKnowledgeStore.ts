import { create } from 'zustand';
import { db, type KnowledgeNote } from '../db/database';

interface KnowledgeStoreState {
  addNote: (note: Omit<KnowledgeNote, 'createdAt'>) => Promise<number>;
  updateNote: (id: number, updates: Partial<KnowledgeNote>) => Promise<number>;
  deleteNote: (id: number) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeStoreState>(() => ({
  addNote: async (note) => {
    return await db.knowledgeNotes.add({
      ...note,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateNote: async (id, updates) => {
    return await db.knowledgeNotes.update(id, updates);
  },
  deleteNote: async (id) => {
    return await db.knowledgeNotes.delete(id);
  }
}));
