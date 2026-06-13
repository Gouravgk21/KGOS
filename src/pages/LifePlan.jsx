import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
import { GOAL_HORIZONS } from '../utils/constants';
import { Sparkles, Compass, Target, Plus, Edit2, CheckCircle } from 'lucide-react';

export default function LifePlan() {
  const [activeTab, setActiveTab] = useState('DECADE');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState('BUSINESS');
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalTarget, setGoalTarget] = useState('');

  // Load Vision/Mission/Values
  const visionData = useLiveQuery(() => db.visionData.toArray()) || [];

  const visionObj = visionData.find(d => d.key === 'vision');
  const missionObj = visionData.find(d => d.key === 'mission');
  const valuesObj = visionData.find(d => d.key === 'values');
  const principlesObj = visionData.find(d => d.key === 'principles');

  // Goals
  const goals = useLiveQuery(
    () => db.goals.where('horizon').equals(activeTab).toArray(),
    [activeTab]
  ) || [];

  const handleSaveVision = async (value) => {
    if (visionObj) {
      await db.visionData.update(visionObj.id, { value });
    } else {
      await db.visionData.add({ key: 'vision', value });
    }
  };

  const handleSaveMission = async (value) => {
    if (missionObj) {
      await db.visionData.update(missionObj.id, { value });
    } else {
      await db.visionData.add({ key: 'mission', value });
    }
  };

  const openAddGoalModal = () => {
    setEditingGoal(null);
    setGoalTitle('');
    setGoalDesc('');
    setGoalCategory('BUSINESS');
    setGoalProgress(0);
    setGoalTarget('');
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalDesc(goal.description || '');
    setGoalCategory(goal.category || 'BUSINESS');
    setGoalProgress(goal.progress || 0);
    setGoalTarget(goal.targetDate || '');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const goalData = {
      horizon: activeTab,
      title: goalTitle,
      description: goalDesc,
      category: goalCategory,
      progress: parseInt(goalProgress),
      targetDate: goalTarget,
      status: goalProgress >= 100 ? 'COMPLETED' : 'ACTIVE',
      updatedAt: new Date().toISOString()
    };

    if (editingGoal) {
      await db.goals.update(editingGoal.id, goalData);
    } else {
      await db.goals.add({
        ...goalData,
        createdAt: new Date().toISOString()
      });
    }

    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Delete this goal?')) {
      await db.goals.delete(id);
      setIsGoalModalOpen(false);
    }
  };

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="w-6 h-6 text-accent" />
          Life Master Plan
        </h1>
        <p className="text-sm text-secondary">Kumar Gourav\'s executive path spanning 2026 to 2031.</p>
      </div>

      <div className="grid grid-2 gap-6">
        {/* Vision Board */}
        <Card header={<span className="card-title">Ultimate Vision (2031)</span>}>
          <textarea
            className="vision-editor w-full text-base font-medium"
            defaultValue={visionObj?.value || ''}
            onBlur={(e) => handleSaveVision(e.target.value)}
            placeholder="Type your grand 2031 vision here..."
          />
        </Card>

        {/* Mission Statement */}
        <Card header={<span className="card-title">Mission Statement</span>}>
          <textarea
            className="vision-editor w-full text-sm"
            defaultValue={missionObj?.value || ''}
            onBlur={(e) => handleSaveMission(e.target.value)}
            placeholder="What is your central purpose?"
          />
        </Card>
      </div>

      {/* Core Values & Principles */}
      <div className="grid grid-2 gap-6">
        <Card header={<span className="card-title">Core Values</span>}>
          <div className="tag-list">
            {valuesObj?.value ? (
              valuesObj.value.map((v, i) => <span key={i} className="tag">{v}</span>)
            ) : (
              <span className="text-sm text-secondary">No core values loaded.</span>
            )}
          </div>
        </Card>

        <Card header={<span className="card-title">Strategic Principles</span>}>
          <ul className="flex flex-col gap-2 list-disc pl-4 text-sm text-secondary">
            {principlesObj?.value ? (
              principlesObj.value.map((p, i) => <li key={i}>{p}</li>)
            ) : (
              <span>No strategic principles defined.</span>
            )}
          </ul>
        </Card>
      </div>

      {/* Goal Hierarchy Section */}
      <Card 
        header={
          <div className="flex justify-between items-center w-full">
            <span className="card-title flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Goal Hierarchy
            </span>
            <Button variant="primary" size="sm" icon={Plus} onClick={openAddGoalModal}>
              Add Goal
            </Button>
          </div>
        }
      >
        <Tabs
          tabs={GOAL_HORIZONS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="grid grid-2 gap-4 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {goals.length > 0 ? (
            goals.map((goal) => (
              <div key={goal.id} className="goal-card flex flex-col justify-between clickable" onClick={() => openEditGoalModal(goal)}>
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-semibold text-primary">{goal.title}</h4>
                    <span className={`badge ${goal.status === 'COMPLETED' ? 'badge-success' : 'badge-neutral'}`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-1">{goal.description}</p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xxs text-muted mb-1">
                    <span>Progress: {goal.progress}%</span>
                    <span>Target: {goal.targetDate || 'No date'}</span>
                  </div>
                  <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center text-sm text-secondary p-8">
              No goals registered for this horizon.
            </div>
          )}
        </div>
      </Card>

      {/* Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? 'Modify Goal' : 'Create New Goal'}
      >
        <form onSubmit={handleSaveGoal} className="flex flex-col gap-4">
          <FormField
            label="Goal Title"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="Build blended carrageenan factory..."
          />
          <FormField
            label="Goal Description"
            type="textarea"
            value={goalDesc}
            onChange={(e) => setGoalDesc(e.target.value)}
            placeholder="More details about objective..."
          />
          <div className="grid-2">
            <FormField
              label="Category"
              type="select"
              value={goalCategory}
              onChange={(e) => setGoalCategory(e.target.value)}
              options={['BUSINESS', 'RESEARCH', 'CAREER', 'AI', 'PERSONAL']}
            />
            <FormField
              label="Progress (%)"
              type="number"
              value={goalProgress}
              onChange={(e) => setGoalProgress(e.target.value)}
            />
          </div>
          <FormField
            label="Target Date"
            type="date"
            value={goalTarget}
            onChange={(e) => setGoalTarget(e.target.value)}
          />

          <div className="flex justify-between mt-4">
            {editingGoal && (
              <Button variant="danger" onClick={() => handleDeleteGoal(editingGoal.id)}>
                Delete Goal
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Goal</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
