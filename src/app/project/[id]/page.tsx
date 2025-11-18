'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project, TimeEntry } from '@/types';
import { api } from '@/lib/api';
import TimeEntryForm from '@/components/TimeEntryForm';
import TimeEntryList from '@/components/TimeEntryList';
import Link from 'next/link';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projects, entriesData] = await Promise.all([
        api.getProjects(),
        api.getTimeEntries(projectId),
      ]);
      
      const foundProject = projects.find(p => p.id === projectId);
      
      if (!foundProject) {
        router.push('/');
        return;
      }

      setProject(foundProject);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error loading project data:', error);
      alert('Fout bij het laden van project data');
    } finally {
      setLoading(false);
    }
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Project laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Terug naar projecten
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Totaal: <span className="font-semibold text-blue-600 dark:text-blue-400">{totalHours.toFixed(2)}h</span>
              </p>
            </div>
          </div>
        </div>

        <TimeEntryForm projectId={projectId} onEntryAdded={loadData} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Geregistreerde uren</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Laden...</p>
            </div>
          ) : (
            <TimeEntryList entries={entries} onEntryDeleted={loadData} />
          )}
        </div>
      </main>
    </div>
  );
}

