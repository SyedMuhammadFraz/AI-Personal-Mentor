"use client";

import { updateGoal } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage";

type Goal = {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  deadline?: Date | null;
  progress: number;
};

type EditGoalFormProps = {
  goal: Goal;
  onCancel: () => void;
};

export default function EditGoalForm({ goal, onCancel }: EditGoalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateGoal(goal.id, formData);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      
      router.refresh();
      onCancel();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error updating goal:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format deadline for input field (YYYY-MM-DD)
  const deadlineValue = goal.deadline
    ? new Date(goal.deadline).toISOString().split("T")[0]
    : "";

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div>
        <label htmlFor={`edit-title-${goal.id}`} className="block text-sm font-medium text-gray-300 mb-2">
          Goal Title *
        </label>
        <input
          id={`edit-title-${goal.id}`}
          name="title"
          className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          placeholder="Goal title"
          defaultValue={goal.title}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor={`edit-description-${goal.id}`} className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id={`edit-description-${goal.id}`}
          name="description"
          rows={3}
          className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
          placeholder="Description (optional)"
          defaultValue={goal.description || ""}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`edit-priority-${goal.id}`} className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            id={`edit-priority-${goal.id}`}
            name="priority"
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            defaultValue={goal.priority}
            disabled={isSubmitting}
          >
            <option value="1" className="bg-gray-800">1 - Low Priority</option>
            <option value="2" className="bg-gray-800">2</option>
            <option value="3" className="bg-gray-800">3 - Medium Priority</option>
            <option value="4" className="bg-gray-800">4</option>
            <option value="5" className="bg-gray-800">5 - High Priority</option>
          </select>
        </div>

        <div>
          <label htmlFor={`edit-deadline-${goal.id}`} className="block text-sm font-medium text-gray-300 mb-2">
            Deadline
          </label>
          <input
            id={`edit-deadline-${goal.id}`}
            type="date"
            name="deadline"
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition [color-scheme:dark]"
            defaultValue={deadlineValue}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`edit-progress-${goal.id}`} className="block text-sm font-medium text-gray-300 mb-2">
          Progress: <span className="text-purple-400">{goal.progress}%</span>
        </label>
        <input
          id={`edit-progress-${goal.id}`}
          type="range"
          name="progress"
          min="0"
          max="100"
          step="5"
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          defaultValue={goal.progress}
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

