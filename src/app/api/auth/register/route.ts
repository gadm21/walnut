import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { query, queryOne } from '@/lib/pg-client';

interface RegisterRequestBody {
  username?: string;
  password?: string;
  max_file_size?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RegisterRequestBody;
    const username = body.username || '';
    const password = body.password || '';
    const max_file_size = body.max_file_size || 10485760; // Default 10MB
    
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    
    // Check if username exists using direct PostgreSQL connection
    const existingUser = await queryOne(
      'SELECT "userId" FROM "User" WHERE username = $1 LIMIT 1',
      [username]
    );
    
    // Check if user was found
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    
    // Hash password
    const hashed_password = await hash(password, 10);
    
    // Insert the new user using direct PostgreSQL connection
    const result = await query(
      'INSERT INTO "User" (username, hashed_password, max_file_size) VALUES ($1, $2, $3) RETURNING "userId", username',
      [username, hashed_password, max_file_size]
    );
    
    // Extract the created user from the result
    const user = result.length > 0 ? result[0] : null;
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    return NextResponse.json({ id: user.userId, username: user.username });
  } catch (err) {
    // Enhanced error logging for debugging
    console.error('Registration error:', {
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined,
      body: typeof req !== 'undefined' ? await req.text().catch(() => null) : null,
    });
    
    // Always return an object as payload
    const message = process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: message || 'Registration failed' }, { status: 500 });
  }
}
