import { create } from 'zustand';
import { db, type Lead } from '../db/database';

interface CRMStoreState {
  addLead: (lead: Omit<Lead, 'createdAt'>) => Promise<number>;
  updateLead: (id: number, updates: Partial<Lead>) => Promise<number>;
  deleteLead: (id: number) => Promise<void>;
}

export const useCRMStore = create<CRMStoreState>(() => ({
  addLead: async (lead) => {
    return await db.leads.add({
      ...lead,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateLead: async (id, updates) => {
    return await db.leads.update(id, updates);
  },
  deleteLead: async (id) => {
    return await db.leads.delete(id);
  }
}));
