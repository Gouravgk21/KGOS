import { create } from 'zustand';
import { db, type Task } from '../db/database';

interface TaskStoreState {
  addTask: (task: Omit<Task, 'createdAt'>) => Promise<number>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<number>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskDone: (id: number) => Promise<number | undefined>;
}

export const useTaskStore = create<TaskStoreState>(() => ({
  addTask: async (task) => {
    return await db.tasks.add({
      ...task,
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      category: task.category || 'ADMIN',
      createdAt: new Date().toISOString()
    }) as number;
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
    await db.tasks.update(id, { status: newStatus });
    return id;
  }
}));
