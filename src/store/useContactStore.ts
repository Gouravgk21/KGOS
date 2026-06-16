import { create } from 'zustand';
import { db, type Contact } from '../db/database';

interface ContactStoreState {
  addContact: (contact: Omit<Contact, 'createdAt'>) => Promise<number>;
  updateContact: (id: number, updates: Partial<Contact>) => Promise<number>;
  deleteContact: (id: number) => Promise<void>;
}

export const useContactStore = create<ContactStoreState>(() => ({
  addContact: async (contact) => {
    return await db.contacts.add({
      ...contact,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateContact: async (id, updates) => {
    return await db.contacts.update(id, updates);
  },
  deleteContact: async (id) => {
    return await db.contacts.delete(id);
  }
}));
