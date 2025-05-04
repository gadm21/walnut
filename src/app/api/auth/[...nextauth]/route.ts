import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import crypto from "crypto";
import { queryOne } from "@/lib/pg-client";

// Define types based on our Prisma schema
type UserType = {
  userId: number;
  username: string;
  hashed_password: string;
  max_file_size?: number;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "your username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }
        
        // Use direct PostgreSQL connection for user lookup
        const user = await queryOne<UserType>(
          'SELECT "userId", username, hashed_password, max_file_size FROM "User" WHERE username = $1 LIMIT 1',
          [credentials.username]
        );
        
        if (!user) {
          throw new Error("No user found with this username");
        }
        
        // Check password
        const isValid = await compare(credentials.password, user.hashed_password);
        if (!isValid) {
          throw new Error("Invalid password");
        }
        
        // Create a session record in the Session table
        // Only create a session record if we're not using NextAuth's built-in sessions
        // This is commented out because we'll use NextAuth's built-in session management
        /*
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hour session
        
        await prisma.session.create({
          data: {
            userId: user.userId,
            token: crypto.randomUUID(), // Generate a unique token
            expires_at: sessionExpiry
          }
        });
        */
        
        // Also retrieve FastAPI access token so frontend can call protected endpoints
        let accessToken: string | undefined;
        try {
          const fastApiRes = await fetch("https://lms-swart-five.vercel.app/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
            }),
          });
          if (fastApiRes.ok) {
            const data: any = await fastApiRes.json();
            accessToken = data.access_token;
          }
        } catch (e) {
          console.error("[NextAuth] Failed to fetch FastAPI token", e);
        }

        return { id: String(user.userId), username: user.username, accessToken };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id; // Pass user ID to the token
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).accessToken = token.accessToken as string | undefined;
        (session.user as any).id = token.id; // Pass user ID to the session
        (session.user as any).username = token.username; // Pass username to the session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
