import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { TASK_PRIORITIES, TASK_CATEGORIES } from '../utils/constants';
import { Plus, ArrowLeft, Trash2, Calendar, Target, Edit2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State - Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskCategory, setTaskCategory] = useState('ADMIN');
  const [taskDue, setTaskDue] = useState('');

  // Form State - Project Edit
  const [projTitle, setProjTitle] = useState('');
  const [projStatus, setProjStatus] = useState('');
  const [projProgress, setProjProgress] = useState(0);

  // Load project & tasks
  const project = useLiveQuery(() => db.projects.get(parseInt(id)), [id]);
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(parseInt(id)).toArray(), [id]) || [];

  const handleAddTask = async (e) => {
    e.preventDefault();
    const newTask = {
      projectId: parseInt(id),
      title: taskTitle,
      priority: taskPriority,
      category: taskCategory,
      status: 'TODO',
      dueDate: taskDue,
      createdAt: new Date().toISOString()
    };

    await db.tasks.add(newTask);
    setIsTaskModalOpen(false);

    // Reset Form
    setTaskTitle('');
    setTaskPriority('MEDIUM');
    setTaskDue('');
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    await db.projects.update(parseInt(id), {
      title: projTitle,
      status: projStatus,
      progress: parseInt(projProgress)
    });
    setIsEditModalOpen(false);
  };

  const toggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    await db.tasks.update(taskId, { status: nextStatus });
  };

  const deleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project and all its tasks?')) {
      await db.tasks.where('projectId').equals(parseInt(id)).delete();
      await db.projects.delete(parseInt(id));
      navigate('/projects');
    }
  };

  if (!project) {
    return (
      <div className="page animate-fade-in p-6">
        <div className="loading-skeleton loading-bar h-12 w-1/3" />
        <div className="loading-skeleton h-40 mt-6" />
      </div>
    );
  }

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="p-2 min-w-0" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">{project.title}</h1>
            <div className="flex gap-2 mt-1">
              <span className="badge badge-neutral">{project.category}</span>
              <span className="badge badge-info">{project.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={Edit2} 
            onClick={() => {
              setProjTitle(project.title);
              setProjStatus(project.status);
              setProjProgress(project.progress || 0);
              setIsEditModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant="danger" icon={Trash2} onClick={deleteProject}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <Card header={<span className="card-title flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> Objective</span>}>
          <p className="text-sm text-secondary leading-relaxed">{project.objective || 'No objective specified.'}</p>
        </Card>
        <Card header={<span className="card-title flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> Timeline</span>}>
          <div className="text-sm text-secondary">
            <div>Start: {formatDate(project.startDate)}</div>
            <div className="mt-1">Target End: {formatDate(project.endDate)}</div>
          </div>
        </Card>
        <Card header={<span className="card-title">Project Progress</span>}>
          <div className="font-mono text-3xl font-bold text-accent">{project.progress || 0}%</div>
          <div className="goal-progress-bar mt-2">
            <div className="goal-progress-fill" style={{ width: `${project.progress || 0}%` }} />
          </div>
        </Card>
      </div>

      {/* Project Tasks */}
      <Card 
        header={
          <div className="flex justify-between items-center w-full">
            <span className="card-title">Task List</span>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsTaskModalOpen(true)}>
              Add Task
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {tasks.length > 0 ? (
            tasks.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 border border-glass rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.status === 'DONE'}
                    onChange={() => toggleTask(t.id, t.status)}
                    className="clickable"
                  />
                  <div>
                    <span className={`text-sm ${t.status === 'DONE' ? 'line-through text-muted' : 'text-primary'}`}>
                      {t.title}
                    </span>
                    <span className="badge badge-neutral text-xxs ml-2">{t.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-secondary">{formatDate(t.dueDate)}</span>
                  <span 
                    className="text-xxs font-mono font-semibold"
                    style={{ color: TASK_PRIORITIES.find(p => p.key === t.priority)?.color }}
                  >
                    {t.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-secondary text-center p-6">No tasks linked to this project.</p>
          )}
        </div>
      </Card>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add Task to Project">
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <FormField
            label="Task Name"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Review formulation raw material certificate..."
            required
          />
          <div className="grid-2">
            <FormField
              label="Priority"
              type="select"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              options={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']}
            />
            <FormField
              label="Category"
              type="select"
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
              options={TASK_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
          </div>
          <FormField
            label="Due Date"
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Project Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project Details">
        <form onSubmit={handleUpdateProject} className="flex flex-col gap-4">
          <FormField
            label="Project Title"
            value={projTitle}
            onChange={(e) => setProjTitle(e.target.value)}
            required
          />
          <div className="grid-2">
            <FormField
              label="Status"
              type="select"
              value={projStatus}
              onChange={(e) => setProjStatus(e.target.value)}
              options={['NOT_STARTED', 'PLANNING', 'ACTIVE', 'WAITING', 'COMPLETED', 'ARCHIVED']}
            />
            <FormField
              label="Progress (%)"
              type="number"
              value={projProgress}
              onChange={(e) => setProjProgress(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
