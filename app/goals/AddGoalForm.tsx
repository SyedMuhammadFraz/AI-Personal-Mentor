"use client";

import { createGoal } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddGoalForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const result = await createGoal(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  return (
    <form action={action} className="mt-6 space-y-3 max-w-md">
      {error && <p className="text-red-500">{error}</p>}

      <input
        name="title"
        className="w-full border p-2 rounded"
        placeholder="Goal title"
        required
      />

      <textarea
        name="description"
        className="w-full border p-2 rounded"
        placeholder="Description (optional)"
      />

      <select name="priority" className="w-full border p-2 rounded" defaultValue="3">
        <option value="1">1 - Low</option>
        <option value="2">2</option>
        <option value="3">3 - Medium</option>
        <option value="4">4</option>
        <option value="5">5 - High</option>
      </select>

      <input
        type="date"
        name="deadline"
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
      >
        Add Goal
      </button>
    </form>
  );
}
