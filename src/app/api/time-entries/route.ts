import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { TimeEntry } from '@/types';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const client = await clientPromise;
    const db = client.db();
    const timeEntriesCollection = db.collection('time_entries');
    const projectsCollection = db.collection('projects');

    let query: any = { userId: session.user.id };
    if (projectId) {
      // Verify project belongs to user
      const project = await projectsCollection.findOne({
        _id: new ObjectId(projectId),
        userId: session.user.id,
      });
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      query.projectId = projectId;
    }

    const entries = await timeEntriesCollection
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const formattedEntries: TimeEntry[] = entries.map((e) => ({
      id: e._id.toString(),
      projectId: e.projectId,
      date: e.date,
      hours: e.hours,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const client = await clientPromise;
    const db = client.db();
    const projectsCollection = db.collection('projects');
    const timeEntriesCollection = db.collection('time_entries');

    // Verify project exists and belongs to user
    const project = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const result = await timeEntriesCollection.insertOne({
      userId: session.user.id,
      projectId,
      date,
      hours: hoursNum,
      description: description?.trim() || null,
      createdAt: new Date(),
    });

    const entry: TimeEntry = {
      id: result.insertedId.toString(),
      projectId,
      date,
      hours: hoursNum,
      description: description?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
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
      return NextResponse.json({ error: 'Time entry ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const timeEntriesCollection = db.collection('time_entries');

    // Verify entry belongs to user
    const entry = await timeEntriesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!entry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    await timeEntriesCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 });
  }
}

