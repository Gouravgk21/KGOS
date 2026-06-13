import { create } from 'zustand';
import { db, type Project } from '../db/database';

interface ProjectStoreState {
  addProject: (project: Omit<Project, 'createdAt'>) => Promise<number>;
  updateProject: (id: number, updates: Partial<Project>) => Promise<number>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectStoreState>(() => ({
  addProject: async (project) => {
    return await db.projects.add({
      ...project,
      status: project.status || 'PLANNING',
      priority: project.priority || 'MEDIUM',
      progress: project.progress || 0,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateProject: async (id, updates) => {
    return await db.projects.update(id, updates);
  },
  deleteProject: async (id) => {
    // Delete project tasks as well
    await db.tasks.where('projectId').equals(id).delete();
    await db.projects.delete(id);
  }
}));
