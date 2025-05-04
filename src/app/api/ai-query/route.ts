import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { query } from '@/lib/pg-client';

// Remote API endpoints
const BACKEND_URLS = [
  "https://lms-swart-five.vercel.app/query"
];

// Use the first URL as primary, others as fallbacks
const PRIMARY_BACKEND_URL = BACKEND_URLS[0];

interface QueryBody {
  query: string;
  chatId?: string;
}

export async function POST(req: NextRequest) {
  // Enforce authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json() as QueryBody;
    
    // Debug session information
    console.log('AI Query - Using local agent - Session data:', {
      user: session.user,
      id: (session.user as any)?.id,
      userId: (session.user as any)?.userId,
    });
    
    // Try to get userId from multiple possible locations
    let userId = parseInt((session.user as any)?.id || '0', 10);
    if (!userId) {
      userId = parseInt((session.user as any)?.userId || '0', 10);
    }
    
    // Get the accessToken from the session (populated via NextAuth callbacks)
    const accessToken = (session.user as any)?.accessToken;
    
    if (!userId) {
      return NextResponse.json({ 
        detail: "User ID not found in session", 
        session: JSON.stringify(session.user)
      }, { status: 400 });
    }

    let responseData;
    
    try {
      // Send query to remote backend AI service
      console.log(`Sending query to ${PRIMARY_BACKEND_URL}:`, body);
      
      try {
        // Get the accessToken from the session (populated via NextAuth callbacks)
        const accessToken = (session.user as any)?.accessToken;
        
        // Try the primary endpoint first
        const backendRes = await fetch(PRIMARY_BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify(body),
          // Allow longer timeout for AI processing
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
        
        console.log(`Backend response status: ${backendRes.status}`);

        if (!backendRes.ok) {
          throw new Error(`Backend returned ${backendRes.status}`);
        }
        
        // Parse response
        const contentType = backendRes.headers.get("content-type") || "application/json";
        const responseText = await backendRes.text();
        
        // Log the first part of the response for debugging
        console.log('Backend response text:', responseText.substring(0, 100) + '...');
        
        // Parse the response based on content type
        if (contentType.includes('application/json')) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = { response: responseText };
        }
      } catch (primaryError) {
        console.error('Error with primary backend:', primaryError);
        
        // Try fallback endpoints if primary fails
        let fallbackSuccess = false;
        
        for (let i = 1; i < BACKEND_URLS.length; i++) {
          try {
            console.log(`Trying fallback endpoint ${i}: ${BACKEND_URLS[i]}`);
            const accessToken = (session.user as any)?.accessToken;
            
            const fallbackRes = await fetch(BACKEND_URLS[i], {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify(body),
              signal: AbortSignal.timeout(30000),
            });
            
            if (!fallbackRes.ok) {
              throw new Error(`Fallback ${i} returned ${fallbackRes.status}`);
            }
            
            const responseText = await fallbackRes.text();
            console.log(`Fallback ${i} response:`, responseText.substring(0, 100) + '...');
            
            try {
              responseData = JSON.parse(responseText);
            } catch {
              responseData = { response: responseText };
            }
            
            fallbackSuccess = true;
            break;
          } catch (fallbackError) {
            console.error(`Fallback ${i} failed:`, fallbackError);
          }
        }
        
        if (!fallbackSuccess) {
          // All endpoints failed
          responseData = { 
            response: `I'm sorry, but I'm currently experiencing connectivity issues with the AI service. Please try again later.

Error details: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`
          };
        }
      }
    } catch (outerError) {
      console.error('Unexpected error in AI query processing:', outerError);
      responseData = { 
        response: 'An unexpected error occurred while processing your request. Please try again later.'
      };
    }
    
    // Use direct PostgreSQL connection to insert into the Query table
    try {
      await query(
        'INSERT INTO "Query" ("userId", "chatId", query_text, response, created_at) VALUES ($1, $2, $3, $4, $5)',
        [userId, body.chatId || null, body.query, responseData.response, new Date()]
      );
    } catch (dbError) {
      console.error('Database error saving query:', dbError);
      // Continue processing even if DB save fails
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("AI Query error:", err);
    return NextResponse.json(
      { error: "Query processing error", detail: err.message },
      { status: 500 }
    );
  }
}
