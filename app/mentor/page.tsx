"use client";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
  id?: string;
  createdAt?: Date;
};

type Goal = {
  id: string;
  title: string;
  description?: string;
  timeframe?: string;
};

const SUGGESTED_QUESTIONS = [
  "How can I break down my goals into smaller tasks?",
  "What's the best way to track my progress?",
  "Help me prioritize my goals",
  "How do I stay motivated?",
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 🔹 Create / load conversationId ONCE and fetch chat history
  useEffect(() => {
    async function initializeConversation() {
      let id = localStorage.getItem("conversationId");

      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("conversationId", id);
      }

      setConversationId(id);

      // Load chat history from database
      try {
        const res = await fetch(`/api/chat/history?conversationId=${id}`);
        if (res.ok) {
          const data = await res.json();
          const loadedMessages = data.messages || [];
          setMessages(loadedMessages);
          setShowSuggestions(loadedMessages.length === 0);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setLoadingHistory(false);
      }
    }

    initializeConversation();
  }, []);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch("/api/goals/demo");
        const data = await res.json();
        setGoals(data.goals || []);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    }
    fetchGoals();
  }, []);

  async function sendMessage(messageText?: string) {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    const userMessage: Message = { 
      role: "user", 
      content: textToSend,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, goals, conversationId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }
      
      const data = await res.json();
      const aiMessage: Message = { 
        role: "assistant", 
        content: data.reply,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unable to process your request. Please try again.";
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `**Error:** ${errorMessage}`,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        },
      ]);
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function startNewConversation() {
    // Clear current conversation from database
    if (conversationId) {
      try {
        await fetch(`/api/chat/clear?conversationId=${conversationId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to clear conversation:", error);
      }
    }

    const newId = crypto.randomUUID();
    localStorage.setItem("conversationId", newId);
    setConversationId(newId);
    setMessages([]);
    setShowSuggestions(true);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (loadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AI Personal Mentor</h1>
            <p className="text-sm text-gray-400">Your intelligent guide to achieving your goals</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={startNewConversation}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition text-sm font-medium"
              title="Start new conversation"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 && !loadingHistory && showSuggestions && (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🤖</div>
              <h2 className="text-2xl font-semibold mb-3">Welcome to your AI Mentor</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                I'm here to help you achieve your goals. Ask me anything about planning, productivity, or personal growth.
              </p>
              
              <div className="space-y-3 max-w-2xl mx-auto">
                <p className="text-sm text-gray-500 mb-4">Try asking:</p>
                {SUGGESTED_QUESTIONS.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(question)}
                    className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id || Math.random()}
                className={`flex gap-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-sm font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] md:max-w-[70%] ${
                    msg.role === "user" ? "order-2" : "order-1"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                        : "bg-gray-800/80 backdrop-blur-sm border border-gray-700"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            h3: ({ children }) => (
                              <h3 className="text-purple-400 font-semibold mt-4 mb-2 first:mt-0">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0">{children}</p>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1 mb-3">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-gray-300">{children}</li>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.createdAt && (
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-sm font-bold order-3">
                    You
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-sm font-bold">
                  AI
                </div>
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your mentor anything..."
                rows={1}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 overflow-y-auto"
                style={{ minHeight: "48px" }}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 px-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
