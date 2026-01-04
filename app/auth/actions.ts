"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { ActionResult, handlePrismaError } from "@/lib/errors";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signup(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Validate input
    const validation = signupSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if user already has a password (credentials account)
      if (existingUser.password) {
        return { error: "User already exists with this email" };
      }
      // User exists but no password (OAuth account) - update with password
      const hashedPassword = await hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: {
          name: name || existingUser.name,
          password: hashedPassword,
        },
      });
      return { error: null };
    }

    // Create new user
    const hashedPassword = await hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { error: null };
  } catch (error) {
    return {
      error: handlePrismaError(error),
    };
  }
}

