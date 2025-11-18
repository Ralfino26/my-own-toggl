import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { Project } from '@/types';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const projectsCollection = db.collection('projects');

    const projects = await projectsCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedProjects: Project[] = projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const projectsCollection = db.collection('projects');

    const result = await projectsCollection.insertOne({
      userId: session.user.id,
      name: name.trim(),
      createdAt: new Date(),
    });

    const project: Project = {
      id: result.insertedId.toString(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const projectsCollection = db.collection('projects');
    const timeEntriesCollection = db.collection('time_entries');

    // Verify project belongs to user
    const project = await projectsCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete project and all its time entries
    await Promise.all([
      projectsCollection.deleteOne({ _id: new ObjectId(id) }),
      timeEntriesCollection.deleteMany({ projectId: id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

