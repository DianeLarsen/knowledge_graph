

import Link from "next/link";

import {
  createProjectAction,
  getUserProjectsAction,
} from "@/app/actions/projects";

export default async function ProjectsPage() {
  const projects = await getUserProjectsAction();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Projects
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Group notes, tasks, references, and events into focused work.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
          Create Project
        </h2>

        <form action={createProjectAction} className="space-y-3">
          <input
            name="title"
            placeholder="Project title"
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <textarea
            name="description"
            placeholder="What is this project trying to accomplish?"
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />

          <select
            name="visibility"
            defaultValue="private"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="private">Private</option>
            <option value="shared">Shared</option>
            <option value="public">Public</option>
          </select>

          <div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No projects yet. Suspiciously peaceful.
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-700 dark:hover:bg-blue-950/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {project.title}
                  </h2>

                  {project.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>
                  )}
                </div>

                <span className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  {project.status}
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Updated {project.updatedAt.toLocaleDateString()}
              </p>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
