import { create } from 'zustand';
import { db } from '../db/database';

export const useTaskStore = create(() => ({
  addTask: async (task) => {
    return await db.tasks.add({
      ...task,
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      category: task.category || 'ADMIN',
      createdAt: new Date().toISOString()
    });
  },
  updateTask: async (id, updates) => {
    return await db.tasks.update(id, updates);
  },
  deleteTask: async (id) => {
    return await db.tasks.delete(id);
  },
  toggleTaskDone: async (id) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    return await db.tasks.update(id, { status: newStatus });
  }
}));
