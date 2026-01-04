import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./components/LogoutButton";

async function getDashboardStats(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      tasks: true,
    },
  });

  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => g.progress < 100).length;
  const completedGoals = goals.filter((g) => g.progress === 100).length;
  const totalTasks = goals.reduce((sum, g) => sum + g.tasks.length, 0);
  const completedTasks = goals.reduce(
    (sum, g) => sum + g.tasks.filter((t) => t.done).length,
    0
  );
  const averageProgress =
    totalGoals > 0
      ? Math.round(
          goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals
        )
      : 0;

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    totalTasks,
    completedTasks,
    averageProgress,
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const stats = user ? await getDashboardStats(user.id) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header with Navigation */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              Welcome back, {session.user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-gray-400">
              Your personalized growth journey powered by AI
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href="/goals"
              className="px-4 py-2 bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700 rounded-lg transition text-sm font-medium"
            >
              Goals
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalGoals}</p>
              <p className="text-xs text-gray-400">Total Goals</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.activeGoals}</p>
              <p className="text-xs text-gray-400">Active Goals</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.completedTasks}</p>
              <p className="text-xs text-gray-400">Tasks Done</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-amber-500/10 backdrop-blur-xl border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              <p className="text-xs text-gray-400">Avg Progress</p>
            </div>
          </section>
        )}

        {/* Main Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Mentor AI Card */}
          <Link href="/mentor" className="group">
            <div className="bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 h-full flex flex-col">
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  AI Mentor
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Get personalized AI-powered advice, guidance, and learning paths tailored to your goals and aspirations.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                <span>Start Conversation</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Goals Card */}
          <Link href="/goals" className="group">
            <div className="bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  Your Goals
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Track your progress, manage tasks, and stay accountable with structured planning and visual progress tracking.
                </p>
              </div>
              {stats && stats.totalGoals > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Overall Progress</span>
                    <span>{stats.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.averageProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="mt-auto pt-4 flex items-center text-purple-400 font-medium group-hover:translate-x-2 transition-transform">
                <span>Manage Goals</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Analytics Card */}
          <div className="bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 h-full flex flex-col opacity-75">
            <div className="mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Progress Insights</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered analysis of your consistency, habits, and actionable improvements. Coming soon!
              </p>
            </div>
            <div className="mt-auto pt-4">
              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        {stats && stats.totalGoals > 0 && (
          <section className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/goals"
                className="flex items-center gap-3 p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Add New Goal</p>
                  <p className="text-xs text-gray-500">Create a new objective</p>
                </div>
              </Link>

              <Link
                href="/mentor"
                className="flex items-center gap-3 p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ask Your Mentor</p>
                  <p className="text-xs text-gray-500">Get AI guidance</p>
                </div>
              </Link>

              <div className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg opacity-50">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Welcome Message for New Users */}
        {stats && stats.totalGoals === 0 && (
          <section className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first goal and let your AI mentor guide you every step of the way.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/goals"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg transition shadow-lg shadow-purple-500/20"
              >
                Create Your First Goal
              </Link>
              <Link
                href="/mentor"
                className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white font-semibold rounded-lg transition"
              >
                Chat with Mentor
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Logged in as: <span className="text-gray-400 font-medium">{session.user?.name ?? session.user?.email}</span></p>
        </div>
      </footer>
    </main>
  );
}
