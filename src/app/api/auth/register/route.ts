import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { query, queryOne } from '@/lib/pg-client';

interface RegisterRequestBody {
  username?: string;
  password?: string;
  max_file_size?: number;
  phoneNumber?: string;
  role?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RegisterRequestBody;
    const username = body.username || '';
    const password = body.password || '';
    const max_file_size = body.max_file_size || 10485760; // Default 10MB
    const phoneNumber = body.phoneNumber; // Optional
    const role = body.role; // Required from frontend
    
    if (!username || !password || typeof role === 'undefined') {
      return NextResponse.json({ error: "Username, password, and role are required" }, { status: 400 });
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

    // Check if phone number exists if provided
    if (phoneNumber) {
      const existingUserByPhone = await queryOne(
        'SELECT "userId" FROM "User" WHERE phone_number = $1 LIMIT 1',
        [phoneNumber]
      );
      if (existingUserByPhone) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
      }
    }
    
    // Hash password
    const hashed_password = await hash(password, 10);
    
    // Insert the new user using direct PostgreSQL connection
    const result = await query(
      'INSERT INTO "User" (username, hashed_password, max_file_size, phone_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING "userId", username',
      [username, hashed_password, max_file_size, phoneNumber, role]
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
