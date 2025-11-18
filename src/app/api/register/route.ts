import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';

export const runtime = 'nodejs';

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = registerSchema.parse(body);

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Gebruikersnaam is al in gebruik' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const result = await usersCollection.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Account aangemaakt', userId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Fout bij het aanmaken van account' },
      { status: 500 }
    );
  }
}

