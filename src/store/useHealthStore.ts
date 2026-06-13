import { create } from 'zustand';
import { db, type HealthLog, type Habit } from '../db/database';

interface HealthStoreState {
  addHealthLog: (log: Omit<HealthLog, 'id'>) => Promise<number>;
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'streak' | 'longestStreak' | 'isActive'>) => Promise<number>;
  toggleHabit: (id: number, dateStr: string) => Promise<number | undefined>;
  updateHabit: (id: number, updates: Partial<Habit>) => Promise<number>;
}

export const useHealthStore = create<HealthStoreState>(() => ({
  addHealthLog: async (log) => {
    return await db.healthLogs.add({
      ...log,
      date: log.date || new Date().toISOString().split('T')[0]
    }) as number;
  },
  addHabit: async (habit) => {
    return await db.habits.add({
      ...habit,
      completedDates: [],
      streak: 0,
      longestStreak: 0,
      isActive: true
    }) as number;
  },
  toggleHabit: async (id, dateStr) => {
    const habit = await db.habits.get(id);
    if (!habit) return;

    const completedDates = [...(habit.completedDates || [])];
    const index = completedDates.indexOf(dateStr);

    if (index > -1) {
      completedDates.splice(index, 1);
    } else {
      completedDates.push(dateStr);
    }

    // Recalculate streak
    completedDates.sort();
    let streak = 0;
    let longestStreak = habit.longestStreak || 0;

    if (completedDates.length > 0) {
      let currentStreak = 0;
      const checkDate = new Date();
      const todayStr = checkDate.toISOString().split('T')[0];
      
      if (completedDates.includes(todayStr)) {
        currentStreak = 1;
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        if (completedDates.includes(yesterdayStr)) {
          currentStreak = 1;
        }
      }

      if (currentStreak > 0) {
        let loop = true;
        while (loop) {
          checkDate.setDate(checkDate.getDate() - 1);
          const matchStr = checkDate.toISOString().split('T')[0];
          if (completedDates.includes(matchStr)) {
            currentStreak++;
          } else {
            loop = false;
          }
        }
      }
      streak = currentStreak;
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    await db.habits.update(id, {
      completedDates,
      streak,
      longestStreak
    });

    return id;
  },
  updateHabit: async (id, updates) => {
    return await db.habits.update(id, updates);
  }
}));
