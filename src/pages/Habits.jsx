import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import ProgressRing from '../components/ui/ProgressRing';
import { CheckCircle, Plus, Flame, Trash2 } from 'lucide-react';
import { HABIT_CATEGORIES } from '../utils/constants';

export default function Habits() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitCat, setHabitCat] = useState('HEALTH');
  const [habitFreq, setHabitFreq] = useState('Daily');

  const habits = useLiveQuery(() => db.habits.toArray()) || [];
  const activeHabits = habits.filter(h => h.isActive);
  const todayStr = new Date().toISOString().split('T')[0];

  // Completion calculation
  const completedToday = activeHabits.filter(h => h.completedDates && h.completedDates.includes(todayStr)).length;
  const completionPercentage = activeHabits.length > 0 ? (completedToday / activeHabits.length) * 100 : 0;

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    await db.habits.add({
      name: habitName,
      category: habitCat,
      frequency: habitFreq,
      completedDates: [],
      streak: 0,
      longestStreak: 0,
      isActive: true
    });

    setHabitName('');
    setIsModalOpen(false);
  };

  const handleToggleHabit = async (id) => {
    const habit = await db.habits.get(id);
    if (!habit) return;

    let completedDates = [...(habit.completedDates || [])];
    const index = completedDates.indexOf(todayStr);

    if (index > -1) {
      completedDates.splice(index, 1);
    } else {
      completedDates.push(todayStr);
    }

    // Sort dates
    completedDates.sort();

    // Recalculate streak
    let streak = 0;
    let longestStreak = habit.longestStreak || 0;

    if (completedDates.length > 0) {
      let currentStreak = 0;
      let checkDate = new Date();
      
      // Start checking from today if completed today, otherwise start from yesterday
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

    await db.habits.update(id, {
      completedDates,
      streak,
      longestStreak
    });
  };

  const handleDeleteHabit = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await db.habits.delete(id);
    }
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-success" />
            Habits Checklist
          </h1>
          <p className="text-sm text-secondary">Establish compounding daily rituals to drive physical energy and sales output.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create Habit
        </Button>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Habit Completion Progress Ring */}
        <Card header={<span className="card-title">Completion Metrics Today</span>} className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex justify-center mb-4">
            <ProgressRing value={completionPercentage} size={100} strokeWidth={8} color="var(--success)" />
          </div>
          <p className="text-sm font-semibold text-primary">{completedToday} of {activeHabits.length} habits completed today</p>
          <span className="text-xs text-muted block mt-1">Consistency compounds results over time.</span>
        </Card>

        {/* Active habits checklist */}
        <Card header={<span className="card-title">Daily Habits</span>}>
          <div className="flex flex-col gap-4">
            {activeHabits.map((habit) => {
              const isCompleted = habit.completedDates && habit.completedDates.includes(todayStr);
              return (
                <div key={habit.id} className="flex justify-between items-center p-3 border border-glass rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleHabit(habit.id)}
                      className="clickable"
                    />
                    <div>
                      <span className={`text-sm font-medium ${isCompleted ? 'line-through text-muted' : 'text-primary'}`}>
                        {habit.name}
                      </span>
                      <span className="badge badge-neutral text-xxs ml-2">{habit.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-orange-500 font-mono font-bold text-xs">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>{habit.streak || 0}d</span>
                    </div>
                    <Button variant="ghost" className="p-1 min-w-0" onClick={() => handleDeleteHabit(habit.id)}>
                      <Trash2 className="w-4 h-4 text-muted hover:text-danger" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {activeHabits.length === 0 && (
              <p className="text-sm text-secondary text-center py-6">No habits registered. Create one above.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Habit Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Habit">
        <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
          <FormField
            label="Habit Name"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="e.g. B2B Sales Prospecting outreach"
            required
          />
          <div className="grid-2">
            <FormField
              label="Category"
              type="select"
              value={habitCat}
              onChange={(e) => setHabitCat(e.target.value)}
              options={HABIT_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
            <FormField
              label="Frequency"
              type="select"
              value={habitFreq}
              onChange={(e) => setHabitFreq(e.target.value)}
              options={['Daily', 'Weekly']}
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Habit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
