import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // redirect to login page if not authenticated
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          AI Personal Mentor Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Your personalized growth journey powered by AI.
        </p>
      </header>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Mentor AI Card */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <Image
            src="/pic.jpg"
            alt="AI Mentor"
            width={500}
            height={180}
            className="rounded-xl mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold mb-3">Chat with Mentor</h2>
          <p className="text-gray-400 mb-6">
            Get AI-powered advice, guidance, and learning paths designed just for you.
          </p>
          <Link href="/mentor">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">
              Open Mentor
            </button>
          </Link>
        </div>

        {/* Goals Card */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <Image
            src="/pic.jpg"
            alt="Goals"
            width={500}
            height={180}
            className="rounded-xl mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold mb-3">Your Goals</h2>
          <p className="text-gray-400 mb-6">
            Track your progress, stay accountable, and achieve more with structured planning.
          </p>
          <Link href="/goals">
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
              View Goals
            </button>
          </Link>
        </div>

        {/* Analytics Card */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <Image
            src="/pic.jpg"
            alt="Analytics"
            width={500}
            height={180}
            className="rounded-xl mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold mb-3">Progress Insights</h2>
          <p className="text-gray-400 mb-6">
            AI analyzes your consistency, habits, and actionable improvements.
          </p>
          <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition">
            View Analytics
          </button>
        </div>

      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-600 text-sm">
        Logged in as: {session.user?.name ?? session.user?.email}
      </footer>
    </main>
  );
}
