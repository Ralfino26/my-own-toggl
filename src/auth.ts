import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

// Lazy load MongoDB to avoid edge runtime issues
const getClientPromise = () => {
  if (typeof window === 'undefined') {
    return import('@/lib/mongodb').then(m => m.default);
  }
  return Promise.resolve(null);
};

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  // No adapter needed for JWT strategy
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { username, password } = loginSchema.parse(credentials);
          const clientPromise = await getClientPromise();
          if (!clientPromise) return null;
          
          const client = await clientPromise;
          const db = client.db();
          const usersCollection = db.collection('users');

          const user = await usersCollection.findOne({ username });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await compare(password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            username: user.username,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

