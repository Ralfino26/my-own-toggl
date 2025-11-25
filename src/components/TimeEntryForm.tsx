'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Play, Pause, Square } from 'lucide-react';

interface TimeEntryFormProps {
  projectId: string;
  onEntryAdded: () => void;
}

export default function TimeEntryForm({ projectId, onEntryAdded }: TimeEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      // Calculate the start time based on paused time
      const now = Date.now();
      startTimeRef.current = now - pausedTimeRef.current * 1000;
      
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        if (startTimeRef.current !== null) {
          const elapsed = Math.floor((currentTime - startTimeRef.current) / 1000);
          setElapsedSeconds(elapsed);
          pausedTimeRef.current = elapsed; // Keep track of elapsed time
        }
      }, 100);
    } else {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Store the current elapsed time when pausing
      pausedTimeRef.current = elapsedSeconds;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number): number => {
    // Round to nearest minute (0.0167 hours = 1 minute)
    return Math.round((seconds / 60)) / 60;
  };

  const handleStartTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    // The useEffect will handle clearing the interval and storing pausedTimeRef
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    const hoursValue = formatHours(elapsedSeconds);
    setHours(hoursValue.toFixed(2));
    setElapsedSeconds(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
  };

  const handleHoursBlur = () => {
    // Round to 2 decimal places when user leaves the field
    if (hours) {
      const hoursNum = parseFloat(hours);
      if (!isNaN(hoursNum) && hoursNum > 0) {
        setHours(hoursNum.toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(hours);
    if (!hoursNum || hoursNum <= 0) return;

    try {
      setSubmitting(true);
      await api.createTimeEntry({
        projectId,
        date,
        hours: hoursNum,
        description: description.trim() || undefined,
      });
      onEntryAdded();
      setHours('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      // Reset timer if running
      if (isRunning) {
        handleStopTimer();
      }
    } catch (error) {
      console.error('Error creating time entry:', error);
      alert('Fout bij het toevoegen van uren');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
      <div>
        <h3 className="text-xl font-semibold mb-6 text-white">Nieuwe uren toevoegen</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Uren
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              onBlur={handleHoursBlur}
              placeholder="0.0"
              className="w-full px-5 py-3.5 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Beschrijving (optioneel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Wat heb je gedaan?"
              className="w-full px-5 py-3.5 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="ios-button px-8 py-3.5 text-base font-semibold w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {submitting ? 'Toevoegen...' : 'Toevoegen'}
          </button>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {elapsedSeconds > 0 && (
              <div className="px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-mono text-lg">
                {formatTime(elapsedSeconds)}
              </div>
            )}
            <div className="flex gap-2">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="px-6 py-3.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl text-white flex items-center gap-2 transition-colors"
                  title="Start timer"
                >
                  <Play size={18} />
                  <span className="hidden sm:inline">Start</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="px-6 py-3.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-xl text-white flex items-center gap-2 transition-colors"
                  title="Pauzeer timer"
                >
                  <Pause size={18} />
                  <span className="hidden sm:inline">Pauzeer</span>
                </button>
              )}
              {elapsedSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleStopTimer}
                  className="px-6 py-3.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-white flex items-center gap-2 transition-colors"
                  title="Stop timer en vul uren in"
                >
                  <Square size={18} />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

