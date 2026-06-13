import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import FocusTimer from '../components/widgets/FocusTimer';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../utils/constants';
import { CheckSquare, Flame, Plus, Play, Info } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Execution() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('REVENUE');
  const [taskPriority, setTaskPriority] = useState('HIGH');

  // Load active habits
  const habits = useLiveQuery(() => db.habits.where('isActive').equals(1).toArray()) || [];
  
  // Load tasks due today or tasks not completed
  const activeTasks = useLiveQuery(() => db.tasks.where('status').notEqual('DONE').toArray()) || [];

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await db.tasks.add({
      title: taskTitle,
      category: taskCategory,
      priority: taskPriority,
      status: 'TODO',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });

    setTaskTitle('');
  };

  const handleToggleTask = async (id, status) => {
    const nextStatus = status === 'DONE' ? 'TODO' : 'DONE';
    await db.tasks.update(id, { status: nextStatus });
  };

  const handleToggleHabit = async (id) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const habit = await db.habits.get(id);
    if (!habit) return;

    let completedDates = [...(habit.completedDates || [])];
    const idx = completedDates.indexOf(todayStr);

    if (idx > -1) {
      completedDates.splice(idx, 1);
    } else {
      completedDates.push(todayStr);
    }

    // Quick inline update
    await db.habits.update(id, {
      completedDates,
      streak: idx > -1 ? Math.max(0, habit.streak - 1) : habit.streak + 1
    });
  };

  const getPriorityTasks = () => {
    return activeTasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').slice(0, 3);
  };

  const getCategoryTasks = (catKey) => {
    return activeTasks.filter(t => t.category === catKey);
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Today\'s Execution Command
          </h1>
          <p className="text-sm text-secondary">Make progress on formulations, B2B sales leads, and self-mastery habits.</p>
        </div>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Quick Add and Top Priorities */}
        <div className="flex flex-col gap-6">
          <Card header={<span className="card-title">Quick Add Task</span>}>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <FormField
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task name..."
              />
              <div className="grid-2">
                <FormField
                  type="select"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  options={TASK_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
                />
                <FormField
                  type="select"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  options={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']}
                />
              </div>
              <Button type="submit" variant="primary" icon={Plus}>Add Task</Button>
            </form>
          </Card>

          {/* Top 3 priorities */}
          <Card header={<span className="card-title text-danger">Top Priorities Today</span>}>
            <div className="flex flex-col gap-3">
              {getPriorityTasks().map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 border border-glass rounded-lg">
                  <input
                    type="checkbox"
                    checked={t.status === 'DONE'}
                    onChange={() => handleToggleTask(t.id, t.status)}
                    className="clickable"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-primary">{t.title}</span>
                    <span className="badge badge-danger text-xxs block mt-1 w-max">{t.priority}</span>
                  </div>
                </div>
              ))}
              {getPriorityTasks().length === 0 && (
                <p className="text-sm text-secondary">No urgent or critical tasks listed today.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Pomodoro Focus Timer */}
        <div>
          <FocusTimer />
        </div>
      </div>

      <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Task lists grouped by Category */}
        <Card header={<span className="card-title">Operational Tasks</span>}>
          <div className="flex flex-col gap-4">
            {TASK_CATEGORIES.map(cat => {
              const catTasks = getCategoryTasks(cat.key);
              if (catTasks.length === 0) return null;
              return (
                <div key={cat.key}>
                  <div className="text-xs font-bold uppercase text-secondary mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </div>
                  <div className="flex flex-col gap-2">
                    {catTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-3 py-2 border-b border-glass last:border-none">
                        <input
                          type="checkbox"
                          checked={t.status === 'DONE'}
                          onChange={() => handleToggleTask(t.id, t.status)}
                          className="clickable"
                        />
                        <span className="text-sm text-primary">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {activeTasks.length === 0 && (
              <p className="text-sm text-secondary text-center py-6">All operational tasks are completed!</p>
            )}
          </div>
        </Card>

        {/* Habit Trackers */}
        <Card header={<span className="card-title">Daily Habits Checklist</span>}>
          <div className="flex flex-col gap-3">
            {habits.map(h => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isCompleted = h.completedDates && h.completedDates.includes(todayStr);
              return (
                <div key={h.id} className="flex justify-between items-center p-3 border border-glass rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleHabit(h.id)}
                      className="clickable"
                    />
                    <span className={`text-sm ${isCompleted ? 'line-through text-muted' : 'text-primary'}`}>{h.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-500 font-mono font-bold text-xs">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{h.streak || 0}d</span>
                  </div>
                </div>
              );
            })}
            {habits.length === 0 && (
              <p className="text-sm text-secondary">No habits registered. Create habits in Self Mastery.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
