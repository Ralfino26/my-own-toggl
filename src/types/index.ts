export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  date: string; // ISO date string
  hours: number;
  description?: string;
  createdAt: string;
}

