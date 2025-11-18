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
    <form onSubmit={handleSubmit} className="mb-8 glass-card p-6 rounded-2xl">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Nieuwe uren toevoegen</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="ios-input w-full px-5 py-3.5 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Uren
          </label>
          <input
            type="number"
            step="0.25"
            min="0.25"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0.0"
            className="ios-input w-full px-5 py-3.5 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Beschrijving (optioneel)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Wat heb je gedaan?"
            className="ios-input w-full px-5 py-3.5 text-base"
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
    </form>
  );
}

