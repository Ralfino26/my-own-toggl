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
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Array van kleuren voor de kaarten - zelfde als homepage
  const cardColors = [
    { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', glow: 'rgba(99, 102, 241, 0.5)', name: 'Indigo' },
    { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)', glow: 'rgba(236, 72, 153, 0.5)', name: 'Pink' },
    { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', glow: 'rgba(34, 197, 94, 0.5)', name: 'Green' },
    { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)', glow: 'rgba(251, 146, 60, 0.5)', name: 'Orange' },
    { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.5)', name: 'Purple' },
    { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.5)', name: 'Blue' },
  ];

  const getCardColor = (index: number) => {
    return cardColors[index % cardColors.length];
  };

  useEffect(() => {
    loadData();
  }, [projectId, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, entriesData] = await Promise.all([
        api.getProjects(),
        api.getTimeEntries(projectId),
      ]);
      
      const foundProject = projectsData.find(p => p.id === projectId);
      
      if (!foundProject) {
        router.push('/');
        return;
      }

      setProjects(projectsData);
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
  
  // Bepaal de kleur op basis van de index van het project in de lijst
  const projectIndex = projects.findIndex(p => p.id === projectId);
  const cardColor = projectIndex >= 0 ? getCardColor(projectIndex) : null;

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
          <div 
            className="relative p-6 rounded-2xl mb-6 overflow-hidden"
            style={cardColor ? {
              background: cardColor.bg,
              border: `1px solid ${cardColor.border}`,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 20px ${cardColor.glow}`,
            } : {
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {project.name}
                </h1>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="text-lg text-white/70 font-medium">
                    Totaal:
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {totalHours.toFixed(2)} uur
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

