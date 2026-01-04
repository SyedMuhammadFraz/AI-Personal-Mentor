import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_HISTORY = 8;

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { message, goals, conversationId } = await req.json();

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: "Message and conversationId are required" },
        { status: 400 }
      );
    }

    // Load recent chat history from database
    const chatHistoryRecords = await prisma.chatMessage.findMany({
      where: {
        userId: user.id,
        conversationId: conversationId,
      },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY * 2, // Get enough to filter recent
    });

    // Reverse to get chronological order and take only the most recent
    const chatHistory = chatHistoryRecords
      .reverse()
      .slice(-MAX_HISTORY)
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    const goalsText = goals && goals.length > 0
  ? goals
      .map((g: any, i: number) => {
        const parts = [`${i + 1}. ${g.title}`];

        if (g.description) parts.push(`Description: ${g.description}`);
        if (g.deadline) parts.push(`Deadline: ${new Date(g.deadline).toLocaleDateString()}`);
        if (g.priority !== undefined) parts.push(`Priority: ${g.priority}`);
        if (g.progress !== undefined) parts.push(`Progress: ${g.progress}%`);

        return parts.join(", ");
      })
      .join("\n")
  : "No goals have been defined yet.";


        const systemPrompt = `
          You are an AI Personal Mentor and Goal Planner - a supportive, knowledgeable guide helping users achieve their personal and professional goals.

          USER GOALS:
          ${goalsText}

          YOUR PERSONALITY:
          - Warm, encouraging, and empathetic
          - Practical and action-oriented
          - Ask thoughtful questions to understand the user better
          - Celebrate progress and provide motivation
          - Be concise but thorough

          RESPONSE GUIDELINES:
          - Always respond in VALID Markdown
          - Be conversational yet structured
          - Adapt your format based on the question (not every response needs all sections)
          - Use the structured format for planning/goal-related questions
          - For casual questions, feel free to be more conversational
          - Insert a blank line after every markdown heading

          STRUCTURED FORMAT (Use for goal planning, task breakdown, strategy questions):

            ### Focus

            Write ONE short paragraph summarizing the key insight or approach.
            The paragraph MUST start on a new line.

            ### Action Plan

            Return a NUMBERED list (1., 2., 3.).
            Do NOT use bullet points (* or -).

            1. First actionable step
            2. Second actionable step
            3. Third actionable step

            ### Time Commitment

            Write a single sentence estimate.

            ### Checkpoint

            Write ONE measurable outcome or milestone.

            OPTIONAL:
            ### Insight

            Only include if it adds value - a tip, warning, or deeper understanding.

          FORMATTING RULES (CRITICAL):
          - Always insert a blank line after every heading
          - Never place text on the same line as a heading
          - Never use bullet points (* or -)
          - Use numbered lists ONLY (1., 2., 3.)
          - Keep responses under 300 words unless the question requires more detail
          `;

    const recentHistory = chatHistory.slice(-MAX_HISTORY);

    const completion = await groq.chat.completions.create({
      model: "groq/compound",
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...recentHistory,
        {
          role: "user",
          content: message
        }
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    // Save messages to database
    await prisma.chatMessage.createMany({
      data: [
        {
          userId: user.id,
          conversationId: conversationId,
          role: "user",
          content: message,
        },
        {
          userId: user.id,
          conversationId: conversationId,
          role: "assistant",
          content: reply,
        },
      ],
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "AI service authentication failed. Please contact support." },
          { status: 503 }
        );
      }
      
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "AI service is currently rate-limited. Please try again in a moment." },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Unable to process your request. Please try again." },
      { status: 500 }
    );
  }
}
