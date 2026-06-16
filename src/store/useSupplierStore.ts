import { create } from 'zustand';
import { db, type Supplier } from '../db/database';

interface SupplierStoreState {
  addSupplier: (supplier: Omit<Supplier, 'createdAt'>) => Promise<number>;
  updateSupplier: (id: number, updates: Partial<Supplier>) => Promise<number>;
  deleteSupplier: (id: number) => Promise<void>;
}

export const useSupplierStore = create<SupplierStoreState>(() => ({
  addSupplier: async (supplier) => {
    return await db.suppliers.add({
      ...supplier,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateSupplier: async (id, updates) => {
    return await db.suppliers.update(id, updates);
  },
  deleteSupplier: async (id) => {
    return await db.suppliers.delete(id);
  }
}));
