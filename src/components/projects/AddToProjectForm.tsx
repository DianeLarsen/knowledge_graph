// /components/projects/AddToProjectForm.tsx
"use client";

import { useTransition } from "react";
import { addEntityToProjectAction } from "@/app/actions/projects";
import type { EntityType, Project } from "@/db/schema";

type AddToProjectFormProps = {
  entityType: EntityType;
  entityId: string;
  projects: Project[];
  defaultProjectRole?: "source" | "working" | "completed" | "reference";
  linkedProjectIds?: string[];
  onLinkedProjectIdsChange?: (projectIds: string[]) => void;
};

export default function AddToProjectForm({
  entityType,
  entityId,
  projects,
  defaultProjectRole = "working",
  linkedProjectIds = [],
  onLinkedProjectIdsChange,
}: AddToProjectFormProps) {
  const [isPending, startTransition] = useTransition();

  const availableProjects = projects.filter(
    (project) => !linkedProjectIds.includes(project.id),
  );

  if (availableProjects.length === 0) {
    return (
      <p className="text-xs text-[rgb(var(--muted))]">
        Already added to all available projects.
      </p>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await addEntityToProjectAction(formData);

          const projectId = String(formData.get("projectId") ?? "");

          if (projectId) {
            onLinkedProjectIdsChange?.([
              ...new Set([...linkedProjectIds, projectId]),
            ]);
          }
        });
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />

      <select
        name="projectId"
        className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-1 text-xs text-[rgb(var(--text))]"
      >
        {availableProjects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>

      <select
        name="projectRole"
        defaultValue={defaultProjectRole}
        className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-1 text-xs text-[rgb(var(--text))]"
      >
        <option value="working">Working</option>
        <option value="source">Source</option>
        <option value="reference">Reference</option>
        <option value="completed">Completed</option>
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add to Project"}
      </button>
    </form>
  );
}
