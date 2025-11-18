import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'toggl.db');

// Ensure the database file exists and initialize tables
export function getDb(): Database.Database {
  const db = new Database(dbPath);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // Create time_entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      date TEXT NOT NULL,
      hours REAL NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_time_entries_projectId ON time_entries(projectId);
    CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
  `);

  return db;
}

