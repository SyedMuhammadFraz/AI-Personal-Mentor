import { getServerSession } from "next-auth/next";
import AddGoalForm from "./AddGoalForm";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "../components/LogoutButton";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import GoalCard from "./GoalCard";

async function getGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center">
          <p className="text-xl mb-4">You must be logged in to view this page.</p>
          <Link href="/login" className="text-purple-400 hover:text-purple-300 underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <p className="text-xl">User not found.</p>
      </div>
    );
  }

  const goals = await getGoals(user.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 md:p-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Your Goals
          </h1>
          <p className="text-gray-400 text-lg">
            Track your progress and achieve your objectives
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700 rounded-lg transition text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/mentor"
            className="px-4 py-2 bg-gray-800/40 hover:bg-gray-700/40 border border-gray-700 rounded-lg transition text-sm font-medium"
          >
            AI Mentor
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Add Goal Form Section */}
      <section className="mb-12">
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Add New Goal</h2>
          <AddGoalForm />
        </div>
      </section>

      {/* Goals List */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Active Goals {goals.length > 0 && <span className="text-gray-400 text-lg">({goals.length})</span>}
        </h2>

        {goals.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-gray-400 mb-2">No goals yet</p>
            <p className="text-gray-500">Create your first goal to get started on your journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
