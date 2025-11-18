'use client';

import { TimeEntry } from '@/types';
import { api } from '@/lib/api';

interface TimeEntryListProps {
  entries: TimeEntry[];
  onEntryDeleted: () => void;
}

export default function TimeEntryList({ entries, onEntryDeleted }: TimeEntryListProps) {
  const handleDelete = async (entryId: string) => {
    if (confirm('Weet je zeker dat je deze entry wilt verwijderen?')) {
      try {
        await api.deleteTimeEntry(entryId);
        onEntryDeleted();
      } catch (error) {
        console.error('Error deleting time entry:', error);
        alert('Fout bij het verwijderen van entry');
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Nog geen uren geregistreerd voor dit project.</p>
      </div>
    );
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-2">
      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:shadow-sm transition-shadow"
        >
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {entry.hours.toFixed(2)}h
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(entry.date)}
                </p>
                {entry.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{entry.description}</p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete(entry.id)}
            className="text-red-500 hover:text-red-700 text-lg font-bold px-2"
            title="Verwijder entry"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

