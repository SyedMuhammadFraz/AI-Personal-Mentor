"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthButton } from "../components/AuthButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      <AuthButton />

      <div className="mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn("email", { email, redirect: true, callbackUrl: "/goals" });
          }}
        >
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-2 px-4 py-2 border rounded w-64"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign in with Email
          </button>
        </form>
      </div>
    </main>
  );
}
