import { create } from 'zustand';
import { db, type HealthLog } from '../db/database';

interface HealthStoreState {
  addHealthLog: (log: Omit<HealthLog, 'createdAt'>) => Promise<number>;
  updateHealthLog: (id: number, updates: Partial<HealthLog>) => Promise<number>;
}

export const useHealthStore = create<HealthStoreState>(() => ({
  addHealthLog: async (log) => {
    return await db.healthLogs.add({
      ...log,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateHealthLog: async (id, updates) => {
    return await db.healthLogs.update(id, updates);
  }
}));
