'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from '@/db/database';
import { useTaskStore } from '@/store/useTaskStore';
import Card from '@/components/ui/Card';
import { CheckSquare, List, Kanban, Calendar as CalendarIcon, Plus, Trash2, Edit } from 'lucide-react';

export default function TasksPage() {
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const { addTask, updateTask, deleteTask } = useTaskStore();

  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('kanban');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('TODO');
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM');
  const [category, setCategory] = useState<Task['category']>('Personal');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editId !== null) {
      await updateTask(editId, { title, description, status, priority, category, dueDate });
      setEditId(null);
    } else {
      await addTask({ title, description, status, priority, category, dueDate });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setCategory('Personal');
    setDueDate('');
    setIsFormOpen(false);
  };

  const handleEdit = (task: Task) => {
    if (task.id === undefined) return;
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setCategory(task.category);
    setDueDate(task.dueDate || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (id === undefined) return;
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  const moveTaskStatus = async (id: number | undefined, nextStatus: Task['status']) => {
    if (id === undefined) return;
    await updateTask(id, { status: nextStatus });
  };

  // Calendar render logic helper
  const getDaysInMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const dateObj = new Date(year, month, 1);
    while (dateObj.getMonth() === month) {
      days.push(new Date(dateObj));
      dateObj.setDate(dateObj.getDate() + 1);
    }
    return days;
  };

  return (
    <div className="page flex flex-col gap-6 animate-fade-in">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-500" />
            Task Workspace
          </h1>
          <p className="text-sm text-zinc-400">Organize operational tasks, study routines, and business formulations.</p>
        </div>
        <button 
          onClick={() => {
            setEditId(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* View Selectors */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
          <button 
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'kanban' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Kanban className="w-3.5 h-3.5" /> Kanban
          </button>
          <button 
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'calendar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>
      </div>

      {isFormOpen && (
        <Card header={<span className="text-zinc-200 font-semibold">{editId !== null ? 'Modify Existing Task' : 'Register New Task'}</span>}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Task Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700" 
                  placeholder="e.g. Test Kappa gel formulation"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value as any)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="Business">Business</option>
                  <option value="Research">Research</option>
                  <option value="Government Exams">Government Exams</option>
                  <option value="Health">Health</option>
                  <option value="Career">Career</option>
                  <option value="Content">Content</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Priority</label>
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value as any)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Status</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as any)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-450 focus:border-zinc-700"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm outline-none text-zinc-200 focus:border-zinc-700 h-20 resize-none"
                placeholder="Details or notes about this action item..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-400"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                {editId !== null ? 'Apply Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Kanban Board View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((col) => {
            const filtered = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="flex flex-col gap-4 bg-zinc-950/20 border border-zinc-850 p-4 rounded-xl min-h-[400px]">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                    {col === 'TODO' ? 'To Do' : col === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                  </span>
                  <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full font-mono">{filtered.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {filtered.map(task => (
                    <div key={task.id} className="p-3 border border-zinc-800 bg-zinc-900/10 rounded-lg flex flex-col gap-2 relative group hover:border-zinc-700 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-semibold text-zinc-200">{task.title}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(task)} className="text-zinc-500 hover:text-zinc-300">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(task.id)} className="text-zinc-500 hover:text-rose-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {task.description && <p className="text-[11px] text-zinc-500">{task.description}</p>}
                      <div className="flex justify-between items-center mt-1 border-t border-zinc-850 pt-2 text-[9px] uppercase tracking-wider text-zinc-500">
                        <span>{task.category}</span>
                        <span className={`px-1.5 py-0.5 rounded font-mono ${
                          task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>{task.priority}</span>
                      </div>
                      {col !== 'DONE' && (
                        <button 
                          onClick={() => moveTaskStatus(task.id, col === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                          className="mt-2 py-1 bg-zinc-950 hover:bg-zinc-900 text-[9px] font-semibold text-zinc-400 hover:text-zinc-200 rounded border border-zinc-850 transition-colors text-center"
                        >
                          Move Forward
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Task</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-zinc-900/20 text-zinc-300">
                    <td className="p-3.5 font-semibold text-zinc-200">{task.title}</td>
                    <td className="p-3.5">{task.category}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>{task.priority}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>{task.status}</span>
                    </td>
                    <td className="p-3.5 font-mono">{task.dueDate || '-'}</td>
                    <td className="p-3.5 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(task)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <Card header={<span className="text-zinc-200 font-semibold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>}>
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800 pb-2 mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((day, idx) => {
              const dayStr = day.toISOString().split('T')[0];
              const dayTasks = tasks.filter(t => t.dueDate === dayStr);
              return (
                <div key={idx} className="min-h-[70px] border border-zinc-850 rounded-lg p-1.5 bg-zinc-950/20 flex flex-col gap-1 align-top text-left">
                  <span className="text-[10px] font-bold text-zinc-500">{day.getDate()}</span>
                  <div className="flex flex-col gap-0.5">
                    {dayTasks.map(t => (
                      <span key={t.id} className="text-[9px] font-medium bg-blue-500/10 text-blue-400 px-1 rounded truncate block">
                        {t.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
