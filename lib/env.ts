/**
 * Environment variable validation and type-safe access
 */

type EnvSchema = {
  // Database
  DATABASE_URL: string;
  
  // Authentication
  GITHUB_ID: string;
  GITHUB_SECRET: string;
  
  // AI Service
  GROQ_API_KEY: string;
  
  // Email (optional in development)
  EMAIL_SERVER?: string;
  EMAIL_FROM?: string;
  
  // Node Environment
  NODE_ENV: "development" | "production" | "test";
  
  // NextAuth
  NEXTAUTH_URL?: string;
  NEXTAUTH_SECRET?: string;
};

type RequiredEnvVars = 
  | "DATABASE_URL"
  | "GITHUB_ID"
  | "GITHUB_SECRET"
  | "GROQ_API_KEY";

type OptionalEnvVars = 
  | "EMAIL_SERVER"
  | "EMAIL_FROM"
  | "NEXTAUTH_URL"
  | "NEXTAUTH_SECRET";

const requiredEnvVars: RequiredEnvVars[] = [
  "DATABASE_URL",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "GROQ_API_KEY",
];

const optionalEnvVars: OptionalEnvVars[] = [
  "EMAIL_SERVER",
  "EMAIL_FROM",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
];

export class EnvValidationError extends Error {
  constructor(
    public missingVars: string[],
    public invalidVars: Array<{ name: string; reason: string }>
  ) {
    const messages: string[] = [];
    
    if (missingVars.length > 0) {
      messages.push(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
    
    if (invalidVars.length > 0) {
      const invalidMessages = invalidVars.map(
        (v) => `${v.name}: ${v.reason}`
      );
      messages.push(`Invalid environment variables:\n${invalidMessages.join("\n")}`);
    }
    
    super(messages.join("\n\n"));
    this.name = "EnvValidationError";
  }
}

/**
 * Validates that all required environment variables are present
 * and have valid values
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const invalid: Array<{ name: string; reason: string }> = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    const value = process.env[varName as string];
    
    if (!value || value.trim() === "") {
      missing.push(varName);
    } else {
      // Additional validation for specific variables
      switch (varName) {
        case "DATABASE_URL":
          if (!value.startsWith("postgresql://") && !value.startsWith("postgres://")) {
            invalid.push({
              name: varName,
              reason: "Must be a valid PostgreSQL connection string (starts with postgresql:// or postgres://)",
            });
          }
          break;
        
        case "GROQ_API_KEY":
          if (value.length < 10) {
            invalid.push({
              name: varName,
              reason: "API key appears to be too short",
            });
          }
          break;
        
        case "GITHUB_ID":
        case "GITHUB_SECRET":
          if (value.length < 10) {
            invalid.push({
              name: varName,
              reason: "Value appears to be too short",
            });
          }
          break;
      }
    }
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !["development", "production", "test"].includes(nodeEnv)) {
    invalid.push({
      name: "NODE_ENV",
      reason: `Must be one of: development, production, test. Got: ${nodeEnv}`,
    });
  }

  // Validate optional variables if they're provided
  if (process.env.EMAIL_SERVER && process.env.NODE_ENV === "production") {
    // In production, EMAIL_SERVER should be a valid URL or connection string
    const emailServer = process.env.EMAIL_SERVER;
    if (!emailServer.includes("://") && !emailServer.includes(":")) {
      invalid.push({
        name: "EMAIL_SERVER",
        reason: "Should be a valid SMTP connection string or URL",
      });
    }
  }

  if (process.env.EMAIL_FROM) {
    const emailFrom = process.env.EMAIL_FROM;
    if (!emailFrom.includes("@")) {
      invalid.push({
        name: "EMAIL_FROM",
        reason: "Should be a valid email address",
      });
    }
  }

  // Validate NEXTAUTH_URL if provided
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch {
      invalid.push({
        name: "NEXTAUTH_URL",
        reason: "Must be a valid URL",
      });
    }
  }

  // Validate NEXTAUTH_SECRET if provided
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    invalid.push({
      name: "NEXTAUTH_SECRET",
      reason: "Should be at least 32 characters long for security",
    });
  }

  if (missing.length > 0 || invalid.length > 0) {
    throw new EnvValidationError(missing, invalid);
  }
}

/**
 * Gets an environment variable with type safety
 * Throws an error if the variable is required but not set
 */
export function getEnv<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
  const value = process.env[key];
  
  if (requiredEnvVars.includes(key as RequiredEnvVars) && (!value || value.trim() === "")) {
    throw new EnvValidationError([key], []);
  }
  
  return value as EnvSchema[K];
}

/**
 * Gets an environment variable with a default value
 * Returns the default if the variable is not set
 */
export function getEnvWithDefault<K extends keyof EnvSchema>(
  key: K,
  defaultValue: EnvSchema[K]
): EnvSchema[K] {
  const value = process.env[key];
  return (value || defaultValue) as EnvSchema[K];
}

/**
 * Gets an optional environment variable
 * Returns undefined if not set
 */
export function getOptionalEnv<K extends OptionalEnvVars>(key: K): string | undefined {
  return process.env[key];
}

/**
 * Returns a summary of environment configuration (safe for logging)
 */
export function getEnvSummary(): Record<string, string> {
  const summary: Record<string, string> = {};
  
  for (const varName of [...requiredEnvVars, ...optionalEnvVars]) {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive values
      if (varName.includes("SECRET") || varName.includes("KEY") || varName.includes("PASSWORD")) {
        summary[varName] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
      } else if (varName === "DATABASE_URL") {
        // Mask database URL but show the structure
        try {
          const url = new URL(value);
          summary[varName] = `${url.protocol}//${url.hostname}${url.pathname ? "..." : ""}`;
        } catch {
          summary[varName] = "***";
        }
      } else {
        summary[varName] = value;
      }
    } else {
      summary[varName] = "(not set)";
    }
  }
  
  return summary;
}

