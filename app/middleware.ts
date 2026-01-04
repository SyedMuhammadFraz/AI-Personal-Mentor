import { withAuth } from "next-auth/middleware";
import { ensureEnvValidated } from "@/lib/env.server";

// Validate environment variables when middleware runs
ensureEnvValidated();

export default withAuth({
  pages: {
    signIn: "/login"
  },
});

export const config = {
  matcher: ["/goals/:path*", "/settings/:path*"],
};
