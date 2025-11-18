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
      month: 'short',
      year: 'numeric',
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20">
        <p className="text-white/70 text-sm">Nog geen uren geregistreerd.</p>
      </div>
    );
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">Uren</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">Datum</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">Beschrijving</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider w-12"></th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-white/5 hover:bg-white/5 transition-colors group last:border-b-0"
            >
              <td className="py-3 px-4">
                <span className="text-sm font-semibold text-white/90">
                  {entry.hours.toFixed(1)}h
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-white/80">
                  {formatDate(entry.date)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-white/70">
                  {entry.description || <span className="text-white/40 italic">—</span>}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-400 hover:text-red-300 text-lg font-light opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 ml-auto"
                  title="Verwijder entry"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

