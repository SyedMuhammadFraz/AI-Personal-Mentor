import { getServerSession } from "next-auth/next";
import AddGoalForm from "./AddGoalForm";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "../components/LogoutButton";
import { authOptions } from "@/lib/auth";

async function getGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="p-6">
        <p>You must be logged in to view this page.</p>
        <a href="/login" className="text-blue-600 underline">Go to Login</a>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return <p>User not found.</p>;
  }
  const goals = await getGoals(user.id);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Your Goals</h1>

      <LogoutButton />

      {/* Form to add a new goal */}
      <AddGoalForm />

      {/* List of goals */}
      <ul className="mt-6 space-y-2">
        {goals.map((goal) => (
          <li key={goal.id} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <strong>{goal.title}</strong>
              <span className="text-sm text-gray-500">Priority: {goal.priority}</span>
            </div>
            {goal.description && (
              <p className="text-sm text-gray-700 mt-1">{goal.description}</p>
            )}
            {goal.deadline && (
              <div className="text-sm text-gray-500 mt-1">
                Deadline: {new Date(goal.deadline).toLocaleDateString()}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
