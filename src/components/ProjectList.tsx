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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projecten</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showAddForm ? 'Annuleren' : '+ Nieuw Project'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProject} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project naam..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
          Toevoegen
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Laden...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Nog geen projecten</p>
          <p>Maak je eerste project aan om te beginnen!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h2>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Verwijder project"
                >
                  ×
                </button>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getTotalHours(project.id).toFixed(1)}h
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Totaal uren</p>
              </div>
              <Link
                href={`/project/${project.id}`}
                className="block w-full text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Open Project
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

