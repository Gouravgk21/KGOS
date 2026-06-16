import { create } from 'zustand';
import { db, type Transaction } from '../db/database';

interface TransactionStoreState {
  addTransaction: (tx: Omit<Transaction, 'createdAt'>) => Promise<number>;
  updateTransaction: (id: number, updates: Partial<Transaction>) => Promise<number>;
  deleteTransaction: (id: number) => Promise<void>;
}

export const useTransactionStore = create<TransactionStoreState>(() => ({
  addTransaction: async (tx) => {
    return await db.transactions.add({
      ...tx,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateTransaction: async (id, updates) => {
    return await db.transactions.update(id, updates);
  },
  deleteTransaction: async (id) => {
    return await db.transactions.delete(id);
  }
}));
