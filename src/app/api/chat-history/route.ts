import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { query } from '@/lib/pg-client';

export async function GET(req: NextRequest) {
  // Enforce authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get the chatId from query parameters
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');
    
    // Debug session information
    console.log('Session data:', {
      user: session.user,
      id: (session.user as any)?.id,
      userId: (session.user as any)?.userId,
    });
    
    // Try to get userId from multiple possible locations
    let userId = parseInt((session.user as any)?.id || '0', 10);
    if (!userId) {
      userId = parseInt((session.user as any)?.userId || '0', 10);
    }
    
    if (!userId) {
      return NextResponse.json({ 
        detail: "User ID not found in session", 
        session: JSON.stringify(session.user)
      }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ detail: "chatId is required" }, { status: 400 });
    }

    // Use direct PostgreSQL connection to query the database
    const queries = await query(
      'SELECT "queryId" as id, "userId", "chatId", query_text, response, created_at FROM "Query" WHERE "userId" = $1 AND "chatId" = $2 ORDER BY created_at ASC',
      [userId, chatId]
    );
    
    // Format the queries into a more usable structure
    const messages = (queries as any[]).map(query => ({
      id: query.id,
      userId: query.userId,
      chatId: query.chatId,
      role: "user", // For user queries
      query_text: query.query_text,
      response: query.response,
      created_at: query.created_at
    }));

    // Return both user queries and assistant responses
    const formattedMessages = [];
    for (const msg of messages) {
      // Add the user message
      formattedMessages.push({
        id: `${msg.id}-user`,
        role: "user",
        query_text: msg.query_text,
        created_at: msg.created_at
      });
      
      // Add the assistant response
      formattedMessages.push({
        id: `${msg.id}-assistant`,
        role: "assistant",
        response: msg.response,
        created_at: new Date(new Date(msg.created_at).getTime() + 1000) // 1 second after user message
      });
    }

    return NextResponse.json({ messages: formattedMessages });
  } catch (err: any) {
    console.error("Chat history error:", err);
    return NextResponse.json(
      { error: "Failed to fetch chat history", detail: err.message },
      { status: 500 }
    );
  }
}
