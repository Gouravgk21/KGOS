import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, TASK_PRIORITIES } from '../utils/constants';
import { Plus, List, Kanban, FolderKanban } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Projects() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('kanban'); // kanban | list
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState('BUSINESS');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PLANNING');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [outcome, setOutcome] = useState('');

  // Live Query Projects
  const projects = useLiveQuery(() => db.projects.toArray()) || [];

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const newProj = {
      title,
      objective,
      category,
      priority,
      status,
      startDate,
      endDate,
      outcome,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    await db.projects.add(newProj);
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setObjective('');
    setOutcome('');
    setStartDate('');
    setEndDate('');
  };

  const getStatusProjects = (statusKey) => {
    return projects.filter(p => p.status === statusKey);
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-accent" />
            Projects Workspace
          </h1>
          <p className="text-sm text-secondary">Formulate, plan, and build KAFS products and digital systems.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Project
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={activeView === 'kanban' ? 'primary' : 'secondary'} 
          size="sm" 
          icon={Kanban} 
          onClick={() => setActiveView('kanban')}
        >
          Kanban Board
        </Button>
        <Button 
          variant={activeView === 'list' ? 'primary' : 'secondary'} 
          size="sm" 
          icon={List} 
          onClick={() => setActiveView('list')}
        >
          List View
        </Button>
      </div>

      {activeView === 'kanban' ? (
        <div className="pipeline-board">
          {PROJECT_STATUSES.map((col) => {
            const columnProjects = getStatusProjects(col.key);
            return (
              <div className="pipeline-column" key={col.key}>
                <div className="pipeline-column-header">
                  <div className="flex items-center gap-2">
                    <span className="status-dot" style={{ backgroundColor: col.color }} />
                    <span>{col.label}</span>
                  </div>
                  <span className="count">{columnProjects.length}</span>
                </div>
                <div className="pipeline-column-body">
                  {columnProjects.map((proj) => (
                    <div 
                      key={proj.id} 
                      className="pipeline-card"
                      onClick={() => navigate(`/projects/${proj.id}`)}
                    >
                      <h4 className="pipeline-card-title text-primary">{proj.title}</h4>
                      <div className="pipeline-card-meta flex justify-between items-center mt-2">
                        <span className="badge badge-neutral">{proj.category}</span>
                        <span 
                          className="text-xxs font-semibold uppercase font-mono"
                          style={{ color: TASK_PRIORITIES.find(p => p.key === proj.priority)?.color }}
                        >
                          {proj.priority}
                        </span>
                      </div>
                      <div className="goal-progress-bar mt-2">
                        <div className="goal-progress-fill" style={{ width: `${proj.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id} className="clickable" onClick={() => navigate(`/projects/${proj.id}`)}>
                    <td className="font-semibold text-primary">{proj.title}</td>
                    <td><span className="badge badge-neutral">{proj.category}</span></td>
                    <td><span className="badge badge-info">{proj.status}</span></td>
                    <td className="font-mono text-xs">{proj.priority}</td>
                    <td>{proj.progress || 0}%</td>
                    <td>{formatDate(proj.startDate)} - {formatDate(proj.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Formulation/System Project">
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <FormField
            label="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Carrageenan Syneresis Control formulation..."
            required
          />
          <FormField
            label="Strategic Objective"
            type="textarea"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Define the primary focus..."
          />
          <FormField
            label="Target Outcome"
            type="textarea"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Expected outcome..."
          />

          <div className="grid-3">
            <FormField
              label="Category"
              type="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={PROJECT_CATEGORIES.map(c => ({ key: c.key, label: c.label }))}
            />
            <FormField
              label="Priority"
              type="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']}
            />
            <FormField
              label="Status"
              type="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={PROJECT_STATUSES.map(s => ({ key: s.key, label: s.label }))}
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Launch Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
