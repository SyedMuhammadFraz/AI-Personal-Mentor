/**
 * Error handling utilities for consistent error management across the application
 */

export type ActionResult<T = void> = {
  error: string | null;
  data?: T;
};

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Wraps a server action with consistent error handling
 */
export async function handleServerAction<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { error: null, data };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    if (error instanceof Error) {
      // Log unexpected errors
      console.error("Unexpected error:", error);
      return { error: "An unexpected error occurred. Please try again." };
    }

    return { error: "An unknown error occurred. Please try again." };
  }
}

/**
 * Handles Prisma errors and returns user-friendly messages
 */
export function handlePrismaError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const prismaError = error as { code?: string; meta?: unknown };
    
    switch (prismaError.code) {
      case "P2002":
        return "This record already exists. Please use a different value.";
      case "P2025":
        return "The record you're trying to access doesn't exist.";
      case "P2003":
        return "Invalid reference. Please check your input.";
      case "P2014":
        return "Invalid relationship. Please check your input.";
      default:
        console.error("Prisma error:", error);
        return "A database error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    console.error("Database error:", error);
    return error.message || "A database error occurred. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Validates required fields and returns error if missing
 */
export function validateRequired(
  fields: Record<string, unknown>,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    const value = fields[field];
    if (value === null || value === undefined || value === "") {
      return `${field} is required`;
    }
  }
  return null;
}

