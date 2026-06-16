import { create } from 'zustand';
import { db, type DocumentItem } from '../db/database';

interface DocumentStoreState {
  addDocument: (doc: Omit<DocumentItem, 'uploadedAt'>) => Promise<number>;
  deleteDocument: (id: number) => Promise<void>;
}

export const useDocumentStore = create<DocumentStoreState>(() => ({
  addDocument: async (doc) => {
    return await db.documents.add({
      ...doc,
      uploadedAt: new Date().toISOString()
    }) as number;
  },
  deleteDocument: async (id) => {
    return await db.documents.delete(id);
  }
}));
