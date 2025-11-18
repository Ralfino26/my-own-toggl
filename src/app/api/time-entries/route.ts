import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { TimeEntry } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const db = getDb();
    let entries: TimeEntry[];

    if (projectId) {
      entries = db
        .prepare('SELECT * FROM time_entries WHERE projectId = ? ORDER BY date DESC, createdAt DESC')
        .all(projectId) as TimeEntry[];
    } else {
      entries = db
        .prepare('SELECT * FROM time_entries ORDER BY date DESC, createdAt DESC')
        .all() as TimeEntry[];
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, date, hours, description } = body;

    if (!projectId || !date || !hours) {
      return NextResponse.json(
        { error: 'projectId, date, and hours are required' },
        { status: 400 }
      );
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      return NextResponse.json({ error: 'Hours must be a positive number' }, { status: 400 });
    }

    const db = getDb();
    
    // Verify project exists
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      projectId,
      date,
      hours: hoursNum,
      description: description?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    db.prepare(
      'INSERT INTO time_entries (id, projectId, date, hours, description, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(entry.id, entry.projectId, entry.date, entry.hours, entry.description || null, entry.createdAt);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Time entry ID is required' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM time_entries WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 });
  }
}

