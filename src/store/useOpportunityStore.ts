import { create } from 'zustand';
import { db, type Opportunity } from '../db/database';

interface OpportunityStoreState {
  addOpportunity: (opp: Omit<Opportunity, 'createdAt'>) => Promise<number>;
  updateOpportunity: (id: number, updates: Partial<Opportunity>) => Promise<number>;
  deleteOpportunity: (id: number) => Promise<void>;
}

export const useOpportunityStore = create<OpportunityStoreState>(() => ({
  addOpportunity: async (opp) => {
    return await db.opportunities.add({
      ...opp,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateOpportunity: async (id, updates) => {
    return await db.opportunities.update(id, updates);
  },
  deleteOpportunity: async (id) => {
    return await db.opportunities.delete(id);
  }
}));
