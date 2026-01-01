"use client";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Goal = {
  id: string;
  title: string;
  description?: string;
  timeframe?: string;
};

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [conversationId, setConversationId] = useState<string>("");

  // 🔹 Create / load conversationId ONCE
  useEffect(() => {
    let id = localStorage.getItem("conversationId");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("conversationId", id);
    }

    setConversationId(id);
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

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, goals, conversationId }),
      });
      const data = await res.json();
      const aiMessage: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full p-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">AI Personal Mentor</h1>

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl max-w-xl ${
                msg.role === "user" ? "bg-blue-600 ml-auto" : "bg-gray-800"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}

          {loading && (
            <div className="bg-gray-800 p-4 rounded-xl w-fit">Thinking...</div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
