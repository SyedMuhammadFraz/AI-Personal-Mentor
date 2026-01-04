"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signup } from "../auth/actions";
import { ErrorMessage } from "../components/ErrorMessage";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/goals";

  async function handleGitHubSignIn() {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("github", { callbackUrl, redirect: true });
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setError("Failed to sign in with GitHub. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);
    try {
      await signIn("email", { email, redirect: true, callbackUrl });
    } catch (error) {
      console.error("Email sign in error:", error);
      setError("Failed to send magic link. Please try again.");
      setIsEmailLoading(false);
    }
  }

  async function handlePasswordSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPasswordLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsPasswordLoading(false);
      } else if (result?.ok) {
        const url = callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`;
        router.push(url);
        router.refresh();
      } else {
        setError("Failed to sign in. Please try again.");
        setIsPasswordLoading(false);
      }
    } catch (error) {
      console.error("Password sign in error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in. Please try again.");
      setIsPasswordLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSignupLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const result = await signup(formData);
      if (result.error) {
        setError(result.error);
        setIsSignupLoading(false);
        return;
      }

      // After successful signup, automatically sign in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`,
      });

      if (signInResult?.error) {
        setError("Account created but sign in failed. Please try logging in.");
        setIsLogin(true); // Switch to login mode
        setIsSignupLoading(false);
      } else if (signInResult?.ok) {
        const url = callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`;
        router.push(url);
        router.refresh();
      } else {
        setError("Account created but sign in failed. Please try logging in.");
        setIsLogin(true);
        setIsSignupLoading(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to create account. Please try again.");
      setIsSignupLoading(false);
    }
  }

  const isAnyLoading = isLoading || isEmailLoading || isPasswordLoading || isSignupLoading;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 mb-4 shadow-lg shadow-purple-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            AI Personal Mentor
          </h1>
          <p className="text-gray-400 text-lg">
            {isLogin ? "Sign in to continue your journey" : "Create your account"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-900/50 rounded-lg p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setPassword("");
                setName("");
              }}
              disabled={isAnyLoading}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                isLogin
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setPassword("");
              }}
              disabled={isAnyLoading}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                !isLogin
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Sign Up
            </button>
          </div>

          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          {/* GitHub Login */}
          {isLogin && (
            <button
              onClick={handleGitHubSignIn}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600 group mb-6"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>Continue with GitHub</span>
                </>
              )}
            </button>
          )}

          {/* Divider */}
          {(isLogin || isEmailLoading) && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/40 text-gray-400">Or continue with email</span>
              </div>
            </div>
          )}

          {/* Email Magic Link Login (only in login mode) */}
          {isLogin && (
            <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email-magic" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email-magic"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isAnyLoading}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEmailLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending magic link...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send Magic Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Password Login/Signup Form */}
          <div className={isLogin ? "border-t border-gray-700 pt-6" : ""}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/40 text-gray-400">
                  {isLogin ? "Or sign in with password" : "Create account with password"}
                </span>
              </div>
            </div>

            <form onSubmit={isLogin ? handlePasswordSignIn : handleSignup} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isAnyLoading}
                    className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isAnyLoading}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                  {!isLogin && (
                    <span className="text-xs text-gray-500 ml-1">(min. 8 characters)</span>
                  )}
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isLogin ? undefined : 8}
                  disabled={isAnyLoading}
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isAnyLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-xl transition shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isPasswordLoading || isSignupLoading) ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLogin ? "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"} />
                    </svg>
                    <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Text */}
          <p className="mt-6 text-xs text-center text-gray-500">
            By {isLogin ? "signing in" : "creating an account"}, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
