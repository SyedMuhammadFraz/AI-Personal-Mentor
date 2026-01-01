import { NextResponse } from "next/server";

type Goal = {
  id: string;
  title: string;
  category: "career" | "personal";
  timeframe: string;
  createdAt: string;
};

let goals: Goal[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, timeframe } = body;

    if (!title || !category || !timeframe) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      category,
      timeframe,
      createdAt: new Date().toISOString(),
    };

    goals.push(newGoal);

    return NextResponse.json(newGoal, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(goals);
}
