"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handlePrismaError, type ActionResult } from "@/lib/errors";

export async function createTask(goalId: string, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to create a task" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
      include: {
        tasks: {
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    });

    if (!goal) {
      return { error: "Goal not found or you don't have permission to add tasks" };
    }

    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      return { error: "Task title is required" };
    }

    // Get the next order value
    const nextOrder = goal.tasks.length > 0 ? goal.tasks[0].order + 1 : 0;

    // Create task
    await prisma.task.create({
      data: {
        goalId: goalId,
        title: title,
        notes: formData.get("notes") ? String(formData.get("notes")).trim() || null : null,
        order: nextOrder,
        estimateMins: formData.get("estimateMins") 
          ? Math.max(0, Number(formData.get("estimateMins"))) || null 
          : null,
      },
    });

    revalidatePath("/goals");
    return { error: null };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

export async function updateTask(taskId: string, formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to update a task" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // Verify task belongs to user's goal
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        goal: {
          userId: user.id,
        },
      },
    });

    if (!task) {
      return { error: "Task not found or you don't have permission to update it" };
    }

    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      return { error: "Task title is required" };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title,
        notes: formData.get("notes") ? String(formData.get("notes")).trim() || null : null,
        estimateMins: formData.get("estimateMins") 
          ? Math.max(0, Number(formData.get("estimateMins"))) || null 
          : null,
      },
    });

    revalidatePath("/goals");
    return { error: null };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

export async function toggleTask(taskId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to toggle a task" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // Verify task belongs to user's goal
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        goal: {
          userId: user.id,
        },
      },
    });

    if (!task) {
      return { error: "Task not found or you don't have permission to toggle it" };
    }

    // Toggle task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        done: !task.done,
      },
      include: {
        goal: {
          include: {
            tasks: true,
          },
        },
      },
    });

    // Update goal progress based on completed tasks
    const totalTasks = updatedTask.goal.tasks.length;
    const completedTasks = updatedTask.goal.tasks.filter((t) => t.done).length;
    const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await prisma.goal.update({
      where: { id: updatedTask.goalId },
      data: {
        progress: newProgress,
      },
    });

    revalidatePath("/goals");
    return { error: null };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "You must be logged in to delete a task" };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // Verify task belongs to user's goal and get goal info
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        goal: {
          userId: user.id,
        },
      },
      include: {
        goal: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!task) {
      return { error: "Task not found or you don't have permission to delete it" };
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    // Update goal progress after deletion
    const remainingTasks = task.goal.tasks.filter((t) => t.id !== taskId);
    const totalTasks = remainingTasks.length;
    const completedTasks = remainingTasks.filter((t) => t.done).length;
    const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await prisma.goal.update({
      where: { id: task.goalId },
      data: {
        progress: newProgress,
      },
    });

    revalidatePath("/goals");
    return { error: null };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

