"use server";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveProjectAction,
  getProjectByIdAction,
  getProjectItemsAction,
} from "@/app/actions/projects";

type ProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const PROJECT_ROLE_LABELS = {
  source: "Sources",
  working: "Working Items",
  output: "Outputs",
  reference: "References",
} as const;

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const project = await getProjectByIdAction(projectId);

  if (!project) {
    notFound();
  }

  const items = await getProjectItemsAction(project.id);

  const groupedItems = {
    source: items.filter((item) => item.projectRole === "source"),
    working: items.filter((item) => item.projectRole === "working"),
    output: items.filter((item) => item.projectRole === "output"),
    reference: items.filter((item) => item.projectRole === "reference"),
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div>
        <Link
          href="/projects"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Projects
        </Link>
      </div>

      <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project.title}
            </h1>

            {project.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-gray-300 px-2.5 py-1 capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {project.status}
              </span>

              <span className="rounded-full border border-gray-300 px-2.5 py-1 capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {project.visibility}
              </span>
            </div>
          </div>

          {project.status !== "archived" && (
            <form action={archiveProjectAction.bind(null, project.id)}>
              <button
                type="submit"
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
              >
                Archive
              </button>
            </form>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map(
          (role) => (
            <div
              key={role}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                {PROJECT_ROLE_LABELS[role]}
              </h2>

              {groupedItems[role].length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nothing here yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {groupedItems[role].map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800"
                    >
                      <div className="font-medium capitalize text-gray-800 dark:text-gray-100">
                        {item.entityType}
                      </div>
                      <div className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">
                        {item.entityId}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        )}
      </section>
    </main>
  );
}
