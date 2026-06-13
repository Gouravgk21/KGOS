import Dexie from 'dexie';

export const db = new Dexie('KGOS2031');

db.version(1).stores({
  goals: '++id, horizon, category, status, parentId, projectId, createdAt',
  projects: '++id, category, status, priority, createdAt',
  tasks: '++id, projectId, status, priority, category, dueDate, createdAt',
  healthLogs: '++id, date',
  habits: '++id, category, isActive',
  leads: '++id, stage, industry, createdAt',
  customers: '++id, status, createdAt',
  products: '++id, category, isActive',
  suppliers: '++id, status',
  relationships: '++id, category',
  journal: '++id, date, type',
  notes: '++id, category, *tags',
  skills: '++id, category',
  visionData: '++id, key'
});
