import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import Chart from '../components/ui/Chart';
import { Heart, Plus, Weight, Activity, LogIn } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function Health() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [workoutType, setWorkoutType] = useState('None');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Logs List
  const rawLogs = useLiveQuery(() => db.healthLogs.toArray()) || [];
  
  // Clean logs sorted chronologically for chart
  const logs = [...rawLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Sorted chronologically reverse for history table
  const historyLogs = [...rawLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleLogHealth = async (e) => {
    e.preventDefault();
    const newLog = {
      date,
      weight: parseFloat(weight) || null,
      calories: parseInt(calories) || null,
      protein: parseInt(protein) || null,
      sleepHours: parseFloat(sleepHours) || null,
      sleepQuality: parseInt(sleepQuality),
      energyLevel: parseInt(energyLevel),
      workoutType,
      workoutDuration: parseInt(workoutDuration) || null,
      notes
    };

    await db.healthLogs.add(newLog);
    setIsModalOpen(false);

    // Reset Form fields
    setWeight('');
    setCalories('');
    setProtein('');
    setSleepHours('');
    setNotes('');
  };

  const latestLog = historyLogs[0] || {};

  return (
    <div className="page animate-fade-in flex flex-col gap-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-danger" />
            Health & Vitality
          </h1>
          <p className="text-sm text-secondary">Monitor weight, metrics, energy trends, and daily sleep details.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Log Health Metrics
        </Button>
      </div>

      {/* Vitals overview */}
      <div className="grid grid-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <Card>
          <div className="text-xs text-secondary font-semibold uppercase">Energy Level</div>
          <div className="text-2xl font-mono font-bold text-danger mt-1">{latestLog.energyLevel || 'N/A'}/10</div>
          <span className="text-xxs text-muted">Latest logged</span>
        </Card>
        <Card>
          <div className="text-xs text-secondary font-semibold uppercase">Sleep Duration</div>
          <div className="text-2xl font-mono font-bold text-accent mt-1">{latestLog.sleepHours || 'N/A'} hrs</div>
          <span className="text-xxs text-muted">Quality: {latestLog.sleepQuality || 'N/A'}/5</span>
        </Card>
        <Card>
          <div className="text-xs text-secondary font-semibold uppercase">Latest Weight</div>
          <div className="text-2xl font-mono font-bold text-success mt-1">{latestLog.weight || 'N/A'} kg</div>
          <span className="text-xxs text-muted">Updated: {formatDate(latestLog.date)}</span>
        </Card>
        <Card>
          <div className="text-xs text-secondary font-semibold uppercase">Protein Intake</div>
          <div className="text-2xl font-mono font-bold text-warning mt-1">{latestLog.protein || 'N/A'}g</div>
          <span className="text-xxs text-muted">Calorie budget: {latestLog.calories || 'N/A'} kcal</span>
        </Card>
      </div>

      {/* Chart Visual Trends */}
      {logs.length > 1 && (
        <div className="grid grid-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          <Card header={<span className="card-title">Weight Progression (kg)</span>}>
            <Chart type="line" data={logs} dataKeys={['weight']} xAxisKey="date" colors={['#10b981']} />
          </Card>
          <Card header={<span className="card-title">Energy Level vs Sleep Quality</span>}>
            <Chart type="area" data={logs} dataKeys={['energyLevel', 'sleepQuality']} xAxisKey="date" colors={['#f43f5e', '#3b82f6']} />
          </Card>
        </div>
      )}

      {/* Log History */}
      <Card header={<span className="card-title">Metric History Logs</span>}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight (kg)</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Sleep Hours</th>
                <th>Energy</th>
                <th>Workout</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-semibold text-primary">{formatDate(log.date)}</td>
                  <td>{log.weight || '-'}</td>
                  <td>{log.calories || '-'}</td>
                  <td>{log.protein || '-'}</td>
                  <td>{log.sleepHours || '-'}</td>
                  <td>{log.energyLevel}/10</td>
                  <td>{log.workoutType} {log.workoutDuration ? `(${log.workoutDuration}m)` : ''}</td>
                </tr>
              ))}
              {historyLogs.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-sm text-secondary p-6">No vital logs recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Health Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Daily Health Vitals">
        <form onSubmit={handleLogHealth} className="flex flex-col gap-4">
          <div className="grid-2">
            <FormField
              label="Log Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <FormField
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 74.5"
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Calories (kcal)"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 2100"
            />
            <FormField
              label="Protein (g)"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="e.g. 140"
            />
          </div>

          <div className="grid-3">
            <FormField
              label="Sleep Hours"
              type="number"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="e.g. 7.5"
            />
            <FormField
              label="Sleep Quality (1-5)"
              type="select"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(e.target.value)}
              options={[1, 2, 3, 4, 5]}
            />
            <FormField
              label="Energy Level (1-10)"
              type="select"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Workout Type"
              type="select"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              options={['None', 'Gym/Strength', 'Running/Cardio', 'Yoga', 'Walking', 'Other']}
            />
            <FormField
              label="Duration (min)"
              type="number"
              value={workoutDuration}
              onChange={(e) => setWorkoutDuration(e.target.value)}
              placeholder="e.g. 45"
            />
          </div>

          <FormField
            label="Daily Notes"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log details about food, physical state, or soreness..."
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Log Metrics</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
