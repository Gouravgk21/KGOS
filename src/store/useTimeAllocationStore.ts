import { create } from 'zustand';
import { db, type TimeAllocation } from '../db/database';

interface TimeAllocationStoreState {
  addTimeAllocation: (time: Omit<TimeAllocation, 'createdAt'>) => Promise<number>;
  updateTimeAllocation: (id: number, updates: Partial<TimeAllocation>) => Promise<number>;
}

export const useTimeAllocationStore = create<TimeAllocationStoreState>(() => ({
  addTimeAllocation: async (time) => {
    return await db.timeAllocations.add({
      ...time,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateTimeAllocation: async (id, updates) => {
    return await db.timeAllocations.update(id, updates);
  }
}));
