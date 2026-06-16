import { create } from 'zustand';
import { db, type ResearchPaper } from '../db/database';

interface ResearchStoreState {
  addPaper: (paper: Omit<ResearchPaper, 'createdAt'>) => Promise<number>;
  updatePaper: (id: number, updates: Partial<ResearchPaper>) => Promise<number>;
  deletePaper: (id: number) => Promise<void>;
}

export const useResearchStore = create<ResearchStoreState>(() => ({
  addPaper: async (paper) => {
    return await db.researchPapers.add({
      ...paper,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updatePaper: async (id, updates) => {
    return await db.researchPapers.update(id, updates);
  },
  deletePaper: async (id) => {
    return await db.researchPapers.delete(id);
  }
}));
