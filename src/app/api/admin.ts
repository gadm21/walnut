import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]/route"; // Adjusted path assuming admin.ts is in /api/
import { query, queryOne } from "@/lib/pg-client"; // Adjust path as necessary

interface UserSessionData {
  user?: {
    id?: string;
    username?: string;
    role?: number;
    // ... other session fields
  };
  // ... other session fields
}

// Handler for GET requests to list users
async function handleGetUsers(session: UserSessionData | null) {
  if (!session || !session.user || session.user.role !== 2) { // Role 2 for Admin
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const usersData = await query(
      'SELECT "userId", username, role, phone_number FROM "User" ORDER BY username ASC',
      []
    );
    const users = usersData.map(user => ({
      ...user,
      userId: typeof user.userId === 'bigint' ? user.userId.toString() : user.userId,
    }));
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Handler for DELETE requests to delete a user
async function handleDeleteUser(req: NextRequest, session: UserSessionData | null) {
  if (!session || !session.user || session.user.role !== 2) { // Role 2 for Admin
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userIdToDelete = req.nextUrl.searchParams.get("userId");

  if (!userIdToDelete) {
    return NextResponse.json({ error: "User ID is required for deletion" }, { status: 400 });
  }

  // Prevent admin from deleting themselves (optional, but good practice)
  if (session.user.id === userIdToDelete) {
      return NextResponse.json({ error: "Admin users cannot delete themselves." }, { status: 403 });
  }

  try {
    // Check if user exists before attempting delete
    const userExists = await queryOne('SELECT "userId" FROM "User" WHERE "userId" = $1', [userIdToDelete]);
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Perform deletion
    // Note: This is a simple deletion. You might need to handle related records
    // (e.g., files, sessions, etc.) or use your FastAPI endpoint for more complex deletions.
    await query('DELETE FROM "User" WHERE "userId" = $1', [userIdToDelete]);
    
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session: UserSessionData | null = await getServerSession(authOptions);
  return handleGetUsers(session);
}

export async function DELETE(req: NextRequest) {
  const session: UserSessionData | null = await getServerSession(authOptions);
  return handleDeleteUser(req, session);
}
