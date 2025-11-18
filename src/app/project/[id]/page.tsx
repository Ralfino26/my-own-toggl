'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project, TimeEntry } from '@/types';
import { api } from '@/lib/api';
import TimeEntryForm from '@/components/TimeEntryForm';
import TimeEntryList from '@/components/TimeEntryList';
import Link from 'next/link';
import { SparklesCore } from '@/components/ui/sparkles';

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
      <div className="min-h-screen relative bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <SparklesCore
            id="tsparticlesloading"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-white/20 border-t-white mb-4"></div>
          <p className="text-white/70 text-lg">Project laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesproject"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      <main className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-white/80 font-semibold mb-6 transition-colors group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Terug naar projecten
          </Link>
          <div className="p-6 rounded-2xl mb-6 backdrop-blur-xl bg-white/10 border border-white/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {project.name}
                </h1>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="text-lg text-white/70 font-medium">
                    Totaal:
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {totalHours.toFixed(2)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TimeEntryForm projectId={projectId} onEntryAdded={loadData} />

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6 text-white">Geregistreerde uren</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white mb-4"></div>
              <p className="text-white/70">Laden...</p>
            </div>
          ) : (
            <TimeEntryList entries={entries} onEntryDeleted={loadData} />
          )}
        </div>
      </main>
    </div>
  );
}

