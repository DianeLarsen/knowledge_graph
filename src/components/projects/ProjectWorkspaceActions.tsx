"use client";

import { useState } from "react";
import { Plus, LinkIcon, CheckSquare, StickyNote, Tags } from "lucide-react";
import type { Note, Tag, Reference } from "@/db/schema";

import AddExistingProjectItemForm from "@/components/projects/AddExistingProjectItemForm";
import NewNoteComposer from "@/components/notes/NewNoteComposer";
import ProjectTaskComposer from "@/components/projects/ProjectTaskComposer";
import {
  attachTagToEntityAction,
  removeTagFromEntityAction,
} from "@/app/actions/entityTags";
import type { EntityType } from "@/db/schema";

type ExistingProjectItemOption = {
  id: string;
  title: string;
  entityType: EntityType;
};

type ActivePanel = "note" | "task" | "tag" | "existing" | null;

type ProjectWorkspaceActionsProps = {
  projectId: string;
  existingItems: ExistingProjectItemOption[];
  notes: Note[];
  tags: Tag[];
  references: Reference[];
  attachedTagIds?: string[];
  inlineTagIds?: string[];
  onAttachedTagIdsChange?: (tagIds: string[]) => void;
};

export default function ProjectWorkspaceActions({
  projectId,
  existingItems,
  notes,
  tags,
  references,
  attachedTagIds = [],
  inlineTagIds = [],
  onAttachedTagIdsChange,
}: ProjectWorkspaceActionsProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => [
    ...attachedTagIds,
  ]);
  function togglePanel(panel: Exclude<ActivePanel, null>) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Project Actions
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Create or attach reusable items for this project.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionChip
            icon={<StickyNote size={14} />}
            label="Note"
            isActive={activePanel === "note"}
            onClick={() => togglePanel("note")}
          />

          <ActionChip
            icon={<CheckSquare size={14} />}
            label="Task"
            isActive={activePanel === "task"}
            onClick={() => togglePanel("task")}
          />
          <ActionChip
            icon={<Tags size={14} />}
            label="Tags"
            isActive={activePanel === "tag"}
            onClick={() => togglePanel("tag")}
          />
          <ActionChip
            icon={<LinkIcon size={14} />}
            label="Existing"
            isActive={activePanel === "existing"}
            onClick={() => togglePanel("existing")}
          />
        </div>
      </div>

      {activePanel === "note" && (
        <div className="mt-4">
          <NewNoteComposer
            notes={notes}
            tags={tags}
            references={references}
            projectId={projectId}
            projectRole="working"
            heading="Create Project Note"
            compact
          />
        </div>
      )}

      {activePanel === "task" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
          <ProjectTaskComposer projectId={projectId} />
        </div>
      )}
      {activePanel === "tag" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <Tags size={14} />
            Project Tags
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isAttached = selectedTagIds.includes(tag.id);
                const isInlineTag = inlineTagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={isAttached && isInlineTag}
                    onClick={async () => {
                      const formData = new FormData();

                      formData.append("entityType", "project");
                      formData.append("entityId", projectId);
                      formData.append("tagId", tag.id);

                      if (isAttached && !isInlineTag) {
                        await removeTagFromEntityAction(formData);

                        const next = selectedTagIds.filter(
                          (id) => id !== tag.id,
                        );
                        setSelectedTagIds(next);
                        onAttachedTagIdsChange?.(next);

                        return;
                      }

                      await attachTagToEntityAction(formData);

                      const next = selectedTagIds.includes(tag.id)
                        ? selectedTagIds
                        : [...selectedTagIds, tag.id];

                      setSelectedTagIds(next);
                      onAttachedTagIdsChange?.(next);
                    }}
                    title={
                      isAttached && isInlineTag
                        ? "This tag is used inline and cannot be removed here."
                        : undefined
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      isAttached
                        ? isInlineTag
                          ? "border-purple-300 bg-purple-100 text-purple-800 opacity-80 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-200"
                          : "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    #{tag.name}
                    {isAttached && isInlineTag ? " · inline" : ""}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No tags available.</p>
          )}
        </div>
      )}
      {activePanel === "existing" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/60">
          <AddExistingProjectItemForm
            projectId={projectId}
            existingItems={existingItems}
          />
        </div>
      )}
    </section>
  );
}

function ActionChip({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        isActive
          ? "border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
