import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";
import Email from "next-auth/providers/email";
import { getEnv, getEnvWithDefault, getOptionalEnv } from "./env";

// Build providers array conditionally
const nodeEnv = getEnv("NODE_ENV");
const providers: NextAuthOptions["providers"] = [
  GitHubProvider({
    clientId: getEnv("GITHUB_ID"),
    clientSecret: getEnv("GITHUB_SECRET"),
  }),
];

// Only add Email provider if we have a valid email configuration
if (nodeEnv === "development") {
  // In development, use MailDev
  providers.push(
    Email({
      server: {
        host: "localhost",
        port: 1025,
        auth: {
          user: "user",
          pass: "pass",
        },
      },
      from: getEnvWithDefault("EMAIL_FROM", "no-reply@dev.local"),
    })
  );
} else {
  // In production, only add Email provider if EMAIL_SERVER is configured
  const emailServer = getOptionalEnv("EMAIL_SERVER");
  if (emailServer) {
    providers.push(
      Email({
        server: emailServer,
        from: getEnvWithDefault("EMAIL_FROM", "no-reply@dev.local"),
      })
    );
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }: any) {
      if (session.user) session.user.id = user.id;
      return session;
    },
    redirect({ url, baseUrl }) {
      // force all logins to go to /goals
      return "/goals";
    }
  },
};
