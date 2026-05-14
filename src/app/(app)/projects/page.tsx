// projects/page.tsx

import ProjectList from "@/components/projects/ProjectList";

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

      <ProjectList projects={projects} />
    </main>
  );
}
