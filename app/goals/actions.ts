"use server";

import { prisma } from "@/lib/prisma";
import { GoalSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createGoal(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be logged in to create a goal");
  }

  const rawData = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    priority: Number(formData.get("priority") ?? 3),
    deadline: formData.get("deadline")
      ? new Date(String(formData.get("deadline")))
      : null,
  };

  // Validate using Zod schema
  const parsed = GoalSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Get demo user
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Demo user not found");

  // Persist goal in DB
  await prisma.goal.create({
    data: {
      ...parsed.data,
      userId: user.id,
    },
  });

  // Revalidate Next.js path to refresh UI
  revalidatePath("/goals");

  return { error: null };
}
