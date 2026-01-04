/**
 * Server-side environment variable initialization
 * This file should be imported early in the application lifecycle
 */

import { validateEnv, getEnvSummary } from "./env";

let validated = false;

/**
 * Validates environment variables on server startup
 * Call this early in your application (e.g., in middleware or root layout)
 */
export function ensureEnvValidated(): void {
  if (validated) {
    return;
  }

  try {
    validateEnv();
    validated = true;
    
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Environment variables validated successfully");
      console.log("Environment summary:", getEnvSummary());
    }
  } catch (error) {
    console.error("❌ Environment variable validation failed:");
    console.error(error);
    
    if (error instanceof Error) {
      console.error("\nPlease check your .env file and ensure all required variables are set.");
      console.error("\nRequired variables:");
      console.error("  - DATABASE_URL");
      console.error("  - GITHUB_ID");
      console.error("  - GITHUB_SECRET");
      console.error("  - GROQ_API_KEY");
      console.error("\nOptional variables:");
      console.error("  - EMAIL_SERVER (required in production)");
      console.error("  - EMAIL_FROM");
      console.error("  - NEXTAUTH_URL");
      console.error("  - NEXTAUTH_SECRET");
    }
    
    // In production, we might want to exit, but in development we can be more lenient
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

