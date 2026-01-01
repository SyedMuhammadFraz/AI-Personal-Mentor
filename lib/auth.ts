import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";
import Email from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Email({
      // Use MailDev in development
      server:
        process.env.NODE_ENV === "development"
          ? {
              host: "localhost",
              port: 1025,
              auth: {
                user: "user",
                pass: "pass",
              },
            }
          : process.env.EMAIL_SERVER, // production SMTP
      from: process.env.EMAIL_FROM || "no-reply@dev.local",
    }),
  ],
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
