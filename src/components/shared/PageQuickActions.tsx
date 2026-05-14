// src/components/shared/PageQuickActions.tsx

"use client";

import { useState } from "react";
import {
  Plus,
  CheckSquare,
  Zap,
  LinkIcon,
  Tags,
  ChevronDown,
  ChevronUp,
  FolderKanban,
} from "lucide-react";
import AddToProjectForm from "@/components/projects/AddToProjectForm";
import {
  attachTagToEntityAction,
  removeTagFromEntityAction,
} from "@/app/actions/entityTags";
import { createEntityLinkAction } from "@/app/actions/entityLinks";
import type { EntityType, Project } from "@/db/schema";
import { QuickTag, QuickReference, QuickNote } from "@/lib/tags/tagTypes";

type PageQuickActionsProps = {
  entityType: EntityType;
  entityId: string;
  userId: string;
  tags: QuickTag[];
  references?: QuickReference[];
  notes?: QuickNote[];
  projects: Project[];

  attachedTagIds?: string[];
  linkedNoteIds?: string[];
  linkedReferenceIds?: string[];
  inlineTagIds?: string[];

  onAttachedTagIdsChange?: (tagIds: string[]) => void;
  onLinkedNoteIdsChange?: (noteIds: string[]) => void;
  onLinkedReferenceIdsChange?: (referenceIds: string[]) => void;
};

function getDefaultProjectRole(entityType: EntityType) {
  if (entityType === "reference") return "reference";
  if (entityType === "capture") return "source";
  return "working";
}

export default function PageQuickActions({
  entityType,
  entityId,
  tags,
  references = [],
  notes = [],
  projects,
  attachedTagIds = [],
  linkedNoteIds = [],
  linkedReferenceIds = [],
  inlineTagIds = [],
  onAttachedTagIdsChange,
  onLinkedNoteIdsChange,
  onLinkedReferenceIdsChange,
}: PageQuickActionsProps) {
  const [open, setOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => [
    ...attachedTagIds,
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedReferenceId, setSelectedReferenceId] = useState("");
  
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-6 lg:h-fit">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between text-left lg:hidden"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Quick actions
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <div className={`${open ? "mt-4 block" : "hidden"} space-y-5 lg:block`}>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Create
          </p>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <CheckSquare size={16} />
              Task from this {entityType}
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <Zap size={16} />
              Capture follow-up
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <Plus size={16} />
              New linked note
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <FolderKanban size={14} />
            Project
          </p>

          {projects.length > 0 ? (
            <AddToProjectForm
              entityType={entityType}
              entityId={entityId}
              projects={projects}
              defaultProjectRole={getDefaultProjectRole(entityType)}
            />
          ) : (
            <p className="text-xs text-gray-500">No projects yet.</p>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <Tags size={14} />
            Tags
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isAttached = selectedTagIds.includes(tag.id);
                const isInlineTag = inlineTagIds.includes(tag.id);
                const action =
                  isAttached && !isInlineTag
                    ? removeTagFromEntityAction
                    : attachTagToEntityAction;

                return (
                  <form key={tag.id} action={action}>
                    <input type="hidden" name="entityType" value={entityType} />
                    <input type="hidden" name="entityId" value={entityId} />
                    <input type="hidden" name="tagId" value={tag.id} />

                    <button
                      type="submit"
                      disabled={isAttached && isInlineTag}
                      onClick={() => {
                        const next = selectedTagIds.includes(tag.id)
                          ? isInlineTag
                            ? selectedTagIds
                            : selectedTagIds.filter((id) => id !== tag.id)
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
                  </form>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No tags available.</p>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <LinkIcon size={14} />
            Link existing
          </p>
          {linkedNoteIds.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-500">
                Linked notes
              </p>

              <div className="space-y-1">
                {notes
                  .filter((note) => linkedNoteIds.includes(note.id))
                  .map((note) => (
                    <p
                      key={note.id}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {note.title}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {linkedReferenceIds.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-gray-500">
                Linked references
              </p>

              <div className="space-y-1">
                {references
                  .filter((reference) =>
                    linkedReferenceIds.includes(reference.id),
                  )
                  .map((reference) => (
                    <p
                      key={reference.id}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {reference.title}
                    </p>
                  ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            {notes.length > 0 && (
              <form action={createEntityLinkAction} className="space-y-2">
                <input type="hidden" name="sourceType" value={entityType} />
                <input type="hidden" name="sourceId" value={entityId} />
                <input type="hidden" name="targetType" value="note" />

                <select
                  name="targetId"
                  required
                  value={selectedNoteId}
                  onChange={(event) => setSelectedNoteId(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <option value="" disabled>
                    Choose note...
                  </option>

                  {notes
                    .filter((note) => {
                      if (entityType !== "note") return true;
                      return note.id !== entityId;
                    })
                    .map((note) => (
                      <option key={note.id} value={note.id}>
                        {note.title}
                      </option>
                    ))}
                </select>

                <select
                  name="relationshipType"
                  defaultValue="related"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <option value="related">Related</option>
                  <option value="supports">Supports</option>
                  <option value="references">References</option>
                  <option value="follow_up">Follow up</option>
                  <option value="depends_on">Depends on</option>
                  <option value="extends">Extends</option>
                </select>

                <button
                  type="submit"
                  onClick={() => {
                    if (!selectedNoteId) return;

                    const next = linkedNoteIds.includes(selectedNoteId)
                      ? linkedNoteIds
                      : [...linkedNoteIds, selectedNoteId];

                    onLinkedNoteIdsChange?.(next);
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Link note
                </button>
              </form>
            )}

            {references.length > 0 && (
              <form action={createEntityLinkAction} className="space-y-2">
                <input type="hidden" name="sourceType" value={entityType} />
                <input type="hidden" name="sourceId" value={entityId} />
                <input type="hidden" name="targetType" value="reference" />

                <select
                  name="targetId"
                  required
                  value={selectedReferenceId}
                  onChange={(event) =>
                    setSelectedReferenceId(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <option value="" disabled>
                    Choose reference...
                  </option>

                  {references
                    .filter((reference) => {
                      if (entityType !== "reference") return true;
                      return reference.id !== entityId;
                    })
                    .map((reference) => (
                      <option key={reference.id} value={reference.id}>
                        {reference.title}
                      </option>
                    ))}
                </select>

                <select
                  name="relationshipType"
                  defaultValue="references"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <option value="references">References</option>
                  <option value="uses">Uses</option>
                  <option value="supports">Supports</option>
                  <option value="related">Related</option>
                </select>

                <button
                  type="submit"
                  onClick={() => {
                    if (!selectedReferenceId) return;

                    const next = linkedReferenceIds.includes(
                      selectedReferenceId,
                    )
                      ? linkedReferenceIds
                      : [...linkedReferenceIds, selectedReferenceId];

                    onLinkedReferenceIdsChange?.(next);
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Link reference
                </button>
              </form>
            )}

            {notes.length === 0 && references.length === 0 && (
              <p className="text-xs text-gray-500">
                Nothing available to link yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
