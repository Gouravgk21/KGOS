import { create } from 'zustand';
import { db, type Goal } from '../db/database';

interface GoalStoreState {
  addGoal: (goal: Omit<Goal, 'createdAt'>) => Promise<number>;
  updateGoal: (id: number, updates: Partial<Goal>) => Promise<number>;
  deleteGoal: (id: number) => Promise<void>;
}

export const useGoalStore = create<GoalStoreState>(() => ({
  addGoal: async (goal) => {
    return await db.goals.add({
      ...goal,
      progress: goal.progress || 0,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateGoal: async (id, updates) => {
    return await db.goals.update(id, updates);
  },
  deleteGoal: async (id) => {
    return await db.goals.delete(id);
  }
}));
