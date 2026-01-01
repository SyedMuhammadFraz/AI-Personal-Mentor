"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout ({session.user?.email})
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/" })}
      className="px-4 py-2 bg-green-500 text-white rounded"
    >
      Login with GitHub
    </button>
  );
}
