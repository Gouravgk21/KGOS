import { create } from 'zustand';
import { db, type Product } from '../db/database';

interface ProductStoreState {
  addProduct: (product: Omit<Product, 'createdAt'>) => Promise<number>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<number>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductStoreState>(() => ({
  addProduct: async (product) => {
    return await db.products.add({
      ...product,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateProduct: async (id, updates) => {
    return await db.products.update(id, updates);
  },
  deleteProduct: async (id) => {
    return await db.products.delete(id);
  }
}));
