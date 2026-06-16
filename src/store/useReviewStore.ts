import { create } from 'zustand';
import { db, type DailyReview } from '../db/database';

interface ReviewStoreState {
  addReview: (review: Omit<DailyReview, 'createdAt'>) => Promise<number>;
  updateReview: (id: number, updates: Partial<DailyReview>) => Promise<number>;
}

export const useReviewStore = create<ReviewStoreState>(() => ({
  addReview: async (review) => {
    return await db.dailyReviews.add({
      ...review,
      createdAt: new Date().toISOString()
    }) as number;
  },
  updateReview: async (id, updates) => {
    return await db.dailyReviews.update(id, updates);
  }
}));
