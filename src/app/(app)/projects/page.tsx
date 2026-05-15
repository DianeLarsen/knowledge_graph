// projects/page.tsx

import ProjectList from "@/components/projects/ProjectList";

import {
  createProjectAction,
  getUserProjectsAction,
} from "@/app/actions/projects";

export default async function ProjectsPage() {
  const projects = await getUserProjectsAction();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 bg-[rgb(var(--bg))] px-4 py-8 text-[rgb(var(--text))]">
      <header>
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Projects</h1>

        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Group notes, tasks, references, and events into focused work.
        </p>
      </header>

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[rgb(var(--text))]">
          Create Project
        </h2>

        <form action={createProjectAction} className="space-y-3">
          <input
            name="title"
            placeholder="Project title"
            required
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]"
          />

          <textarea
            name="description"
            placeholder="What is this project trying to accomplish?"
            rows={3}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]"
          />

          <select
            name="visibility"
            defaultValue="private"
            className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
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
