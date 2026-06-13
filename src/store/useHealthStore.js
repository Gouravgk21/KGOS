import { create } from 'zustand';
import { db } from '../db/database';

export const useHealthStore = create(() => ({
  addHealthLog: async (log) => {
    return await db.healthLogs.add({
      ...log,
      date: log.date || new Date().toISOString().split('T')[0]
    });
  },
  addHabit: async (habit) => {
    return await db.habits.add({
      ...habit,
      completedDates: [],
      streak: 0,
      longestStreak: 0,
      isActive: true
    });
  },
  toggleHabit: async (id, dateStr) => {
    const habit = await db.habits.get(id);
    if (!habit) return;

    let completedDates = [...(habit.completedDates || [])];
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
      // Basic daily check
      let currentStreak = 0;
      let checkDate = new Date();
      let todayStr = checkDate.toISOString().split('T')[0];
      
      // If today is completed, start check from today, else start from yesterday
      if (completedDates.includes(todayStr)) {
        currentStreak = 1;
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
        let yesterdayStr = checkDate.toISOString().split('T')[0];
        if (completedDates.includes(yesterdayStr)) {
          currentStreak = 1;
        }
      }

      if (currentStreak > 0) {
        let loop = true;
        while (loop) {
          checkDate.setDate(checkDate.getDate() - 1);
          let matchStr = checkDate.toISOString().split('T')[0];
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

    return await db.habits.update(id, {
      completedDates,
      streak,
      longestStreak
    });
  },
  updateHabit: async (id, updates) => {
    return await db.habits.update(id, updates);
  }
}));
