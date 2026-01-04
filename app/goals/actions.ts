"use server";

import { prisma } from "@/lib/prisma";
import { GoalSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handlePrismaError, type ActionResult } from "@/lib/errors";

export async function createGoal(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to create a goal" };
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

    // Get user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

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
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

export async function updateGoal(goalId: string, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to update a goal" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // Verify goal belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return { error: "Goal not found or you don't have permission to update it" };
    }

    const rawData = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      priority: Number(formData.get("priority") ?? 3),
      deadline: formData.get("deadline")
        ? new Date(String(formData.get("deadline")))
        : null,
      progress: formData.get("progress") ? Number(formData.get("progress")) : existingGoal.progress,
    };

    // Validate using Zod schema (excluding progress)
    const { progress, ...goalData } = rawData;
    const parsed = GoalSchema.safeParse(goalData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    // Update goal in DB
    await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...parsed.data,
        progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
      },
    });

    // Revalidate Next.js path to refresh UI
    revalidatePath("/goals");

    return { error: null };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

export async function deleteGoal(goalId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to delete a goal" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // Verify goal belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return { error: "Goal not found or you don't have permission to delete it" };
    }

    // Delete goal (cascade will delete related tasks and chat messages)
    await prisma.goal.delete({
      where: { id: goalId },
    });

    // Revalidate Next.js path to refresh UI
    revalidatePath("/goals");

    return { error: null };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}