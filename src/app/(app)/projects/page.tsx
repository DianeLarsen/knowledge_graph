import ProjectList from "@/components/projects/ProjectList";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { getUserProjectsAction } from "@/app/actions/projects";

export default async function ProjectsPage() {
  const projects = await getUserProjectsAction();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 bg-[rgb(var(--bg))] px-4 py-8 text-[rgb(var(--text))]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">
            Projects
          </h1>

          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Group notes, tasks, references, and events into focused work.
          </p>
        </div>

        <CreateProjectForm />
      </header>

      <ProjectList projects={projects} />
    </main>
  );
}
