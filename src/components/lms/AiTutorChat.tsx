"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiTutorChatProps {
  chatId?: string;
  courseTitle?: string;
}

export default function AiTutorChat({ chatId = uuidv4(), courseTitle }: AiTutorChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: "assistant",
      content: courseTitle
        ? `Welcome to "${courseTitle}"! I'm your AI tutor for this course. How can I help you today?`
        : "I notice you're studying this lesson. Feel free to ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat history from the server when component mounts
  useEffect(() => {
    if (session && chatId) {
      fetchChatHistory();
    }
  }, [session, chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch previous chat history for this chatId
  async function fetchChatHistory() {
    try {
      const res = await fetch(`/api/chat-history?chatId=${chatId}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const history = await res.json() as { messages?: Array<{ id?: string; role?: string; query_text?: string; response?: string; created_at?: string }> };
        if (history.messages && history.messages.length > 0) {
          // Transform the history data into our message format
          const formattedHistory = history.messages.map(msg => ({
            id: msg.id || uuidv4(),
            role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: (msg.role === "user" ? msg.query_text : msg.response) || "",
            timestamp: new Date(msg.created_at || Date.now()),
          }));
          
          setMessages(formattedHistory as Message[]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  }

  // Simulate typing effect for assistant messages
  const simulateTyping = (message: string, callback: (text: string) => void) => {
    setTyping(true);
    let i = 0;
    const speed = 15; // milliseconds per character
    const typeCharacter = () => {
      if (i < message.length) {
        callback(message.substring(0, i + 1));
        i++;
        setTimeout(typeCharacter, speed);
      } else {
        setTyping(false);
      }
    };
    typeCharacter();
  };

  async function sendMessage() {
    if (!input.trim() || !session) return;

    const messageId = uuidv4();
    const userMessage: Message = { 
      id: messageId, 
      role: "user", 
      content: input.trim(),
      timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "/api/ai-query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            query: userMessage.content,
            chatId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data: any = await res.json();
      const assistantReply = data.response || data.detail || data.error || "Sorry, something went wrong.";
      
      // Add a placeholder for the typing animation
      const replyId = uuidv4();
      setMessages((prev) => [
        ...prev,
        { 
          id: replyId, 
          role: "assistant", 
          content: "", 
          timestamp: new Date() 
        },
      ]);
      
      // Simulate typing for a more natural feel
      simulateTyping(assistantReply, (text) => {
        setMessages((prev) => {
          return prev.map(msg => {
            if (msg.id === replyId) {
              return { ...msg, content: text };
            }
            return msg;
          });
        });
      });
    } catch (err: any) {
      console.error("[AiTutorChat] Error querying AI tutor", err);
      let errorMessage = "Sorry, I couldn't get a response. Please try again later.";
      
      // Check for the test instance message
      if (err.message?.includes('test instance') || 
          (typeof err === 'string' && err.includes('test instance'))) {
        errorMessage = "The AI tutor is currently in development mode. Our team is working on fully configuring it. You can still explore the course content while we complete this feature.";
      } else if (err.response?.data?.detail) {
        // Extract any details from the error response
        errorMessage = `Error: ${err.response.data.detail}`;
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: errorMessage,
          timestamp: new Date()
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border/40 p-6 h-[32rem] flex flex-col">
      <h3 className="font-medium mb-4 flex items-center">
        <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </span>
        AI Tutor Assistant {session ? '✅' : '❌'}
      </h3>
      {/* Debug session info */}
      {!session && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-xs">
          Not logged in. Please sign in to use the AI Tutor.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "text-right"
                : "text-left bg-secondary/30 rounded-lg p-3"
            }
          >
            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 relative">
        <textarea
          rows={1}
          placeholder="Ask your AI tutor a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full resize-none px-4 py-2 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="absolute right-2 top-2 text-primary disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
