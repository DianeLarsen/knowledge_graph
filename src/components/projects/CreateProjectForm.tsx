"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createProjectAction } from "@/app/actions/projects";

export default function CreateProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreateProject(formData: FormData) {
    try {
      setIsCreating(true);
      setMessage("");

      await createProjectAction(formData);

      formRef.current?.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
      setMessage("Could not create project.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <section className="w-full max-w-lg rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[rgb(var(--text))]">
                  Create Project
                </h2>
                <p className="mt-1 text-xs text-[rgb(var(--muted))]">
                  Start a focused container for related notes, tasks,
                  references, and events.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-bold text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg))]"
              >
                ×
              </button>
            </div>

            <form
              ref={formRef}
              action={handleCreateProject}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">
                  Title
                </label>
                <input
                  name="title"
                  placeholder="Example: Capture workflow cleanup"
                  required
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[rgb(var(--muted))]">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="What is this project trying to accomplish?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
                />
              </div>

              <select
                name="visibility"
                defaultValue="private"
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="public">Public</option>
              </select>

              {message && (
                <p className="text-xs text-red-600 dark:text-red-300">
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-[rgb(var(--border))] pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg))]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
