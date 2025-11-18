'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface TimeEntryFormProps {
  projectId: string;
  onEntryAdded: () => void;
}

export default function TimeEntryForm({ projectId, onEntryAdded }: TimeEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
              step="0.25"
              min="0.25"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
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
        <button
          type="submit"
          disabled={submitting}
          className="ios-button mt-6 px-8 py-3.5 text-base font-semibold w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          {submitting ? 'Toevoegen...' : 'Toevoegen'}
        </button>
      </div>
    </form>
  );
}

