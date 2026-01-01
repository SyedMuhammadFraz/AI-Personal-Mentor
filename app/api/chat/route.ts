import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

const chatStore = new Map<
  string,
  { role: "user" | "assistant"; content: string }[]
>();

const MAX_HISTORY = 8;

export async function POST(req: Request) {
  try {
    const { message, goals, conversationId } = await req.json();

    if (!message || !conversationId) {
      return NextResponse.json(
        { error: "Message and conversationId are required" },
        { status: 400 }
      );
    }

    // Initialize conversation if not exists
    if (!chatStore.has(conversationId)) {
      chatStore.set(conversationId, []);
    }

    const chatHistory = chatStore.get(conversationId)!;

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
          You are an AI Personal Mentor and Goal Planner.

          USER GOALS:
          ${goalsText}

          RESPONSE RULES:
          - Always respond in VALID Markdown
          - Be concise and actionable
          - Do NOT explain your role
          - Ask at most ONE follow-up question
          - Insert a blank line after every markdown heading

          FORMAT (YOU MUST FOLLOW THIS EXACT MARKDOWN TEMPLATE):

            ### Focus

            Write ONE short paragraph here.
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

            Write ONE measurable outcome.

            OPTIONAL:
            ### Insight

            Only include if it adds value.

            FORMATTING RULES (CRITICAL):
            - Always insert a blank line after every heading
            - Never place text on the same line as a heading
            - Never use bullet points (* or -)
            - Use numbered lists ONLY (1., 2., 3.)
          `;

    const recentHistory = chatHistory.slice(-MAX_HISTORY);

    const completion = await groq.chat.completions.create({
      model: "groq/compound",
      max_tokens: 300,
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

    chatHistory.push({ role: "user", content: message });
    chatHistory.push({ role: "assistant", content: reply });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Groq error:", error);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}
