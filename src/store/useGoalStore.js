import { create } from 'zustand';
import { db } from '../db/database';

export const useGoalStore = create(() => ({
  addGoal: async (goal) => {
    return await db.goals.add({
      ...goal,
      progress: goal.progress || 0,
      status: goal.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    });
  },
  updateGoal: async (id, updates) => {
    return await db.goals.update(id, updates);
  },
  deleteGoal: async (id) => {
    return await db.goals.delete(id);
  }
}));
