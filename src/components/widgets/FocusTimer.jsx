import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Award } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function FocusTimer() {
  const [mode, setMode] = useState('WORK'); // WORK | BREAK
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            // Toggle mode and reset
            const nextMode = mode === 'WORK' ? 'BREAK' : 'WORK';
            setMode(nextMode);
            return nextMode === 'WORK' ? 25 * 60 : 5 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'WORK' ? 25 * 60 : 5 * 60);
  };

  const setWorkMode = () => {
    setIsRunning(false);
    setMode('WORK');
    setTimeLeft(25 * 60);
  };

  const setBreakMode = () => {
    setIsRunning(false);
    setMode('BREAK');
    setTimeLeft(5 * 60);
  };

  const formatTimeStr = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="focus-timer flex flex-col items-center text-center p-6">
      <div className="flex gap-2 mb-4 justify-center">
        <Button 
          variant={mode === 'WORK' ? 'primary' : 'ghost'} 
          size="sm" 
          icon={Award}
          onClick={setWorkMode}
        >
          Work (25m)
        </Button>
        <Button 
          variant={mode === 'BREAK' ? 'success' : 'ghost'} 
          size="sm" 
          icon={Coffee}
          onClick={setBreakMode}
        >
          Break (5m)
        </Button>
      </div>

      <div 
        className="focus-timer-display font-mono text-4xl font-bold my-4 tracking-wider"
        style={{ color: mode === 'WORK' ? 'var(--accent-blue)' : 'var(--success)' }}
      >
        {formatTimeStr(timeLeft)}
      </div>

      <div className="focus-timer-label text-xs text-secondary mb-4 uppercase tracking-widest font-semibold">
        {mode === 'WORK' ? 'Stay Focused' : 'Recharge Time'}
      </div>

      <div className="focus-timer-controls flex gap-3 justify-center">
        <Button variant="secondary" onClick={toggleTimer} icon={isRunning ? Pause : Play}>
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button variant="ghost" onClick={resetTimer} icon={RotateCcw}>
          Reset
        </Button>
      </div>
    </Card>
  );
}
