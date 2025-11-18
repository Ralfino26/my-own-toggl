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
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Nieuwe uren toevoegen</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Uren
          </label>
          <input
            type="number"
            step="0.25"
            min="0.25"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Beschrijving (optioneel)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Wat heb je gedaan?"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Toevoegen...' : 'Toevoegen'}
      </button>
    </form>
  );
}

