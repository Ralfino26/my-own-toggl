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
      <div className="text-center py-12 glass-card rounded-2xl">
        <div className="text-5xl mb-3">⏱️</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Nog geen uren geregistreerd voor dit project.</p>
      </div>
    );
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          className="glass-card p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-all duration-200 group"
        >
          <div className="flex-1">
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#0051D5] flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {entry.hours.toFixed(1)}h
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {formatDate(entry.date)}
                </p>
                {entry.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{entry.description}</p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete(entry.id)}
            className="text-red-500 hover:text-red-600 text-2xl font-light opacity-60 hover:opacity-100 transition-opacity w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
            title="Verwijder entry"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

