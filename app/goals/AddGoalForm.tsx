"use client";

import { createGoal } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorMessage } from "../components/ErrorMessage";

export default function AddGoalForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function action(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createGoal(formData);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      
      // Reset form
      const form = document.getElementById("goal-form") as HTMLFormElement;
      if (form) {
        form.reset();
      }
      
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error creating goal:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="goal-form" action={action} className="space-y-4">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Goal Title *
        </label>
        <input
          id="title"
          name="title"
          className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          placeholder="e.g., Learn TypeScript, Run a Marathon..."
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
          placeholder="Add more details about your goal (optional)"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            defaultValue="3"
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
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            name="deadline"
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition [color-scheme:dark]"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Goal...
          </span>
        ) : (
          "Create Goal"
        )}
      </button>
    </form>
  );
}
