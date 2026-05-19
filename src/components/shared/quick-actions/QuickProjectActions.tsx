"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddToProjectForm from "@/components/projects/AddToProjectForm";
import type { EntityType, Project } from "@/db/schema";
import { createProjectAndAddEntityAction } from "@/app/actions/quickActions";

type QuickProjectActionsProps = {
  entityType: EntityType;
  entityId: string;
  projects: Project[];
};

function getDefaultProjectRole(entityType: EntityType) {
  if (entityType === "reference") return "reference";
  if (entityType === "capture") return "source";
  return "working";
}

export default function QuickProjectActions({
  entityType,
  entityId,
  projects,
}: QuickProjectActionsProps) {
  const [title, setTitle] = useState("");

  async function handleCreateProject(formData: FormData) {
    await createProjectAndAddEntityAction(formData);
    setTitle("");
  }

  return (
      <div className="space-y-3">
        {projects.length > 0 ? (
          <AddToProjectForm
            entityType={entityType}
            entityId={entityId}
            projects={projects}
            defaultProjectRole={getDefaultProjectRole(entityType)}
          />
        ) : (
          <p className="text-xs text-[rgb(var(--muted))]">No projects yet.</p>
        )}

        <form action={handleCreateProject} className="space-y-2">
          <input type="hidden" name="entityType" value={entityType} />
          <input type="hidden" name="entityId" value={entityId} />
          <input
            type="hidden"
            name="projectRole"
            value={getDefaultProjectRole(entityType)}
          />

          <input
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="New project name"
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
          />

          <button className="flex w-full items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800">
            <Plus size={16} />
            Create project and add
          </button>
        </form>
      </div>
  );
}
