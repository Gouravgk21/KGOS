import { create } from 'zustand';
import { db } from '../db/database';

export const useProjectStore = create(() => ({
  addProject: async (project) => {
    return await db.projects.add({
      ...project,
      status: project.status || 'PLANNING',
      priority: project.priority || 'MEDIUM',
      progress: project.progress || 0,
      createdAt: new Date().toISOString()
    });
  },
  updateProject: async (id, updates) => {
    return await db.projects.update(id, updates);
  },
  deleteProject: async (id) => {
    // Delete project tasks as well
    await db.tasks.where('projectId').equals(id).delete();
    return await db.projects.delete(id);
  }
}));
