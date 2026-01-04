"use client";

import { useState } from "react";
import { deleteGoal } from "./actions";
import { useRouter } from "next/navigation";
import EditGoalForm from "./EditGoalForm";
import TaskList from "./TaskList";
import { ErrorMessage } from "../components/ErrorMessage";

type Goal = {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  deadline?: Date | null;
  progress: number;
  createdAt: Date;
  tasks: Array<{
    id: string;
    title: string;
    notes?: string | null;
    done: boolean;
    order: number;
    estimateMins?: number | null;
    createdAt: Date;
  }>;
};

type GoalCardProps = {
  goal: Goal;
};

function getPriorityColor(priority: number) {
  if (priority >= 4) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (priority === 3) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
}

function getPriorityLabel(priority: number) {
  if (priority >= 4) return "High";
  if (priority === 3) return "Medium";
  return "Low";
}

export default function GoalCard({ goal }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const completedTasks = goal.tasks.filter((t) => t.done).length;
  const totalTasks = goal.tasks.length;
  const progress = goal.progress || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
  
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
  const daysUntilDeadline = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    
    try {
      const result = await deleteGoal(goal.id);
      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error deleting goal:", err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (isEditing) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-purple-400">Edit Goal</h3>
        <EditGoalForm 
          goal={{
            id: goal.id,
            title: goal.title,
            description: goal.description,
            priority: goal.priority,
            deadline: goal.deadline,
            progress: goal.progress,
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition hover:border-purple-500/30 relative group">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Goal?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Are you sure you want to delete &quot;{goal.title}&quot;? This action cannot be undone.
            </p>
            {error && (
              <ErrorMessage message={error} onDismiss={() => setError(null)} className="mb-4" />
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Header */}
      <div className="mb-4">
        {/* Header Row: Title, Priority Badge, and Action Buttons */}
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Title - Takes available space */}
          <h3 className="text-xl font-semibold text-white flex-1 min-w-0">
            {goal.title}
          </h3>
          
          {/* Right Side: Priority Badge and Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Priority Badge */}
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium border whitespace-nowrap ${getPriorityColor(goal.priority)}`}
            >
              {getPriorityLabel(goal.priority)}
            </span>
            
            {/* Action Buttons - Show on hover (desktop) and always visible (mobile) */}
            <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition text-sm flex items-center justify-center"
                title="Edit goal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition text-sm flex items-center justify-center"
                title="Delete goal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-medium text-purple-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Deadline */}
      {goal.deadline && (
        <div className={`text-sm mb-4 ${isOverdue ? 'text-red-400' : daysUntilDeadline !== null && daysUntilDeadline <= 7 ? 'text-yellow-400' : 'text-gray-400'}`}>
          <span className="font-medium">Deadline: </span>
          <span>{new Date(goal.deadline).toLocaleDateString()}</span>
          {daysUntilDeadline !== null && (
            <span className="ml-2">
              {isOverdue 
                ? `(Overdue by ${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) !== 1 ? 's' : ''})`
                : daysUntilDeadline === 0 
                ? "(Today)"
                : daysUntilDeadline === 1
                ? "(Tomorrow)"
                : `(${daysUntilDeadline} days left)`
              }
            </span>
          )}
        </div>
      )}

      {/* Tasks List */}
      <TaskList goalId={goal.id} tasks={goal.tasks} />

      {/* Goal Meta Info */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
        <span>Created {new Date(goal.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

