'use client';

import { useState, useEffect } from 'react';
import { Project, TimeEntry } from '@/types';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, entriesData] = await Promise.all([
        api.getProjects(),
        api.getTimeEntries(),
      ]);
      setProjects(projectsData);
      setTimeEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Fout bij het laden van data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await api.createProject(projectName.trim());
      setProjectName('');
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Fout bij het aanmaken van project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Weet je zeker dat je dit project wilt verwijderen? Alle uren worden ook verwijderd.')) {
      try {
        await api.deleteProject(projectId);
        await loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Fout bij het verwijderen van project');
      }
    }
  };

  const getTotalHours = (projectId: string): number => {
    return timeEntries
      .filter(entry => entry.projectId === projectId)
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  // Array van kleuren voor de kaarten - pas deze aan naar jouw voorkeur!
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

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Projecten
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="ios-button px-6 py-3 text-base font-semibold w-full sm:w-auto"
        >
          {showAddForm ? 'Annuleren' : '+ Nieuw Project'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="mb-8 p-6 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project naam..."
              className="flex-1 px-5 py-3.5 text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              autoFocus
            />
            <button
              type="submit"
              className="ios-button px-8 py-3.5 text-base font-semibold w-full sm:w-auto"
            >
              Toevoegen
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"></div>
          <p className="mt-4 text-white/70 text-lg">Laden...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-3xl p-12 backdrop-blur-xl bg-white/10 border border-white/20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl font-semibold mb-2 text-white">Nog geen projecten</p>
          <p className="text-white/70">Maak je eerste project aan om te beginnen!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const color = getCardColor(index);
            return (
              <div
                key={project.id}
                className="relative p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 20px ${color.glow}`,
                }}
              >
                {/* Glowing effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at center, ${color.glow} 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <h2 className="text-xl font-semibold text-white group-hover:text-white transition-colors pr-2">
                      {project.name}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-2xl font-light opacity-60 hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20"
                      title="Verwijder project"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-white mb-1">
                      {getTotalHours(project.id).toFixed(1)}h
                    </p>
                    <p className="text-sm text-white/70 font-medium">Totaal uren</p>
                  </div>
                  <Link
                    href={`/project/${project.id}`}
                    className="block w-full text-center px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-semibold backdrop-blur-sm border border-white/20"
                  >
                    Open Project
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

