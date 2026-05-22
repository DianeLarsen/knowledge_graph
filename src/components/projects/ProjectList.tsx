"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Project } from "@/db/schema";

type ProjectListProps = {
  projects: Project[];
};

export default function ProjectList({ projects }: ProjectListProps) {
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    const baseProjects = includeArchived
      ? projects
      : projects.filter((project) => project.status !== "archived");

    if (!query) return baseProjects;

    return baseProjects.filter((project) => {
      return (
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
      );
    });
  }, [projects, search, includeArchived]);

  return (
    <section className="space-y-4">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search projects..."
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={includeArchived}
          onChange={(event) => setIncludeArchived(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Include archived
      </label>
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No matching projects. The database remains dramatic.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
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
                {project.status === "archived" ? (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    Archived
                  </span>
                ) : (
                  <span className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-medium capitalize text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    {project.status}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Updated {project.updatedAt.toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
