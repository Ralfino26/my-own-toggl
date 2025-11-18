import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Project } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const projects = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all() as Project[];
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const db = getDb();
    const project: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    db.prepare('INSERT INTO projects (id, name, createdAt) VALUES (?, ?, ?)').run(
      project.id,
      project.name,
      project.createdAt
    );

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

