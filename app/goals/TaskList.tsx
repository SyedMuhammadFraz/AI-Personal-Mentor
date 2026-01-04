"use client";

import { useState } from "react";
import { createTask, toggleTask, deleteTask, updateTask } from "./taskActions";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "../components/ErrorMessage";

type Task = {
  id: string;
  title: string;
  notes?: string | null;
  done: boolean;
  order: number;
  estimateMins?: number | null;
  createdAt: Date;
};

type TaskListProps = {
  goalId: string;
  tasks: Task[];
};

export default function TaskList({ goalId, tasks }: TaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCreateTask(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createTask(goalId, formData);
    setIsLoading(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowAddForm(false);
    router.refresh();
  }

  async function handleToggleTask(taskId: string) {
    setIsLoading(true);
    setError(null);
    const result = await toggleTask(taskId);
    setIsLoading(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await deleteTask(taskId);
    setIsLoading(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleUpdateTask(taskId: string, formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await updateTask(taskId, formData);
    setIsLoading(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditingTaskId(null);
    router.refresh();
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-300">Tasks</h4>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
          }}
          disabled={isLoading}
          className="text-xs text-purple-400 hover:text-purple-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showAddForm ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          className="mb-3"
        />
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <form action={handleCreateTask} className="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700">
          <input
            name="title"
            placeholder="Task title..."
            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
            required
            autoFocus
          />
          <div className="flex gap-2">
            <input
              name="notes"
              placeholder="Notes (optional)"
              className="flex-1 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              name="estimateMins"
              type="number"
              placeholder="Est. mins"
              className="w-24 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
          >
            Add Task
          </button>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No tasks yet. Add one to get started!</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id}>
              {editingTaskId === task.id ? (
                <TaskEditForm
                  task={task}
                  onSave={(formData) => handleUpdateTask(task.id, formData)}
                  onCancel={() => setEditingTaskId(null)}
                />
              ) : (
                <div className="flex items-start gap-2 p-2 hover:bg-gray-900/30 rounded-lg group">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        task.done
                          ? "text-gray-500 line-through"
                          : "text-gray-300"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-xs text-gray-500 mt-1">{task.notes}</p>
                    )}
                    {task.estimateMins && (
                      <span className="text-xs text-gray-600 mt-1 inline-block">
                        ⏱ {task.estimateMins} min{task.estimateMins !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => setEditingTaskId(task.id)}
                      className="p-1 text-gray-400 hover:text-purple-400 transition"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type TaskEditFormProps = {
  task: Task;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
};

function TaskEditForm({ task, onSave, onCancel }: TaskEditFormProps) {
  async function handleSubmit(formData: FormData) {
    onSave(formData);
  }

  return (
    <form action={handleSubmit} className="p-2 bg-gray-900/50 rounded-lg border border-purple-500/30">
      <input
        name="title"
        defaultValue={task.title}
        className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
        required
        autoFocus
      />
      <div className="flex gap-2 mb-2">
        <input
          name="notes"
          defaultValue={task.notes || ""}
          placeholder="Notes (optional)"
          className="flex-1 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <input
          name="estimateMins"
          type="number"
          defaultValue={task.estimateMins || ""}
          placeholder="Est. mins"
          className="w-24 bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          min="0"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

