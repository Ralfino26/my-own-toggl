import { Project, TimeEntry } from '@/types';

const API_BASE = '/api';

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async createProject(name: string): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/projects?id=${projectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },

  // Time Entries
  async getTimeEntries(projectId?: string): Promise<TimeEntry[]> {
    const url = projectId
      ? `${API_BASE}/time-entries?projectId=${projectId}`
      : `${API_BASE}/time-entries`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch time entries');
    return response.json();
  },

  async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<TimeEntry> {
    const response = await fetch(`${API_BASE}/time-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error('Failed to create time entry');
    return response.json();
  },

  async deleteTimeEntry(entryId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/time-entries?id=${entryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete time entry');
  },
};

