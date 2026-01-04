import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import Email from "next-auth/providers/email";
import { getEnv, getEnvWithDefault, getOptionalEnv } from "./env";
import { compare } from "bcryptjs";

// Build providers array conditionally
const nodeEnv = getEnv("NODE_ENV");
const providers: NextAuthOptions["providers"] = [
  GitHubProvider({
    clientId: getEnv("GITHUB_ID"),
    clientSecret: getEnv("GITHUB_SECRET"),
  }),
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await compare(credentials.password, user.password);
      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
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
  session: { strategy: "jwt" }, // Use JWT for credentials provider compatibility
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub || token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    redirect({ url, baseUrl }) {
      // Always redirect to /goals after login
      // Return absolute URL to prevent "Failed to construct URL" errors
      return `${baseUrl}/goals`;
    }
  },
  pages: {
    signIn: "/login",
  },
};
