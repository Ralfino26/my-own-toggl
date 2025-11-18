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

    // Check MongoDB connection
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set');
      return NextResponse.json(
        { error: 'Database configuratie ontbreekt. Controleer je .env bestand.' },
        { status: 500 }
      );
    }

    let client: Awaited<typeof clientPromise>;
    try {
      // Add timeout for connection
      client = await Promise.race([
        clientPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);
    } catch (connectionError) {
      console.error('MongoDB connection error:', connectionError);
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Unknown error';
      
      // More specific error messages
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Database verbinding timeout. Controleer je MongoDB Atlas IP whitelist en netwerk instellingen.' },
          { status: 500 }
        );
      }
      
      if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
        return NextResponse.json(
          { error: 'Database authenticatie mislukt. Controleer je MongoDB credentials.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Kan niet verbinden met database: ${errorMessage}. Controleer je MongoDB instellingen.` },
        { status: 500 }
      );
    }
    
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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Mongo') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database verbinding mislukt. Controleer je MongoDB instellingen.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Fout bij het aanmaken van account: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Fout bij het aanmaken van account' },
      { status: 500 }
    );
  }
}

