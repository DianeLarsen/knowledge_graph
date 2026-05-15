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
  <aside className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-[rgb(var(--text))] shadow-sm lg:sticky lg:top-6 lg:h-fit">
    <button
      type="button"
      onClick={() => setOpen((current) => !current)}
      className="flex w-full items-center justify-between text-left text-[rgb(var(--text))] lg:hidden"
    >
      <span className="text-sm font-semibold">Quick actions</span>
      {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>

    <div className={`${open ? "mt-4 block" : "hidden"} space-y-5 lg:block`}>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
          Create
        </p>

        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <CheckSquare size={16} />
            Task from this {entityType}
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Zap size={16} />
            Capture follow-up
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Plus size={16} />
            New linked note
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
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
          <p className="text-xs text-[rgb(var(--muted))]">No projects yet.</p>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
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
                        : "border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
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
          <p className="text-xs text-[rgb(var(--muted))]">No tags available.</p>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
          <LinkIcon size={14} />
          Link existing
        </p>

        {linkedNoteIds.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-[rgb(var(--muted))]">
              Linked notes
            </p>

            <div className="space-y-1">
              {notes
                .filter((note) => linkedNoteIds.includes(note.id))
                .map((note) => (
                  <p
                    key={note.id}
                    className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-1 text-xs text-[rgb(var(--text))]"
                  >
                    {note.title}
                  </p>
                ))}
            </div>
          </div>
        )}

        {linkedReferenceIds.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-[rgb(var(--muted))]">
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
                    className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-1 text-xs text-[rgb(var(--text))]"
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
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
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
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
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
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
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
                onChange={(event) => setSelectedReferenceId(event.target.value)}
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
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
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))]"
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

                  const next = linkedReferenceIds.includes(selectedReferenceId)
                    ? linkedReferenceIds
                    : [...linkedReferenceIds, selectedReferenceId];

                  onLinkedReferenceIdsChange?.(next);
                }}
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Link reference
              </button>
            </form>
          )}

          {notes.length === 0 && references.length === 0 && (
            <p className="text-xs text-[rgb(var(--muted))]">
              Nothing available to link yet.
            </p>
          )}
        </div>
      </div>
    </div>
  </aside>
);
}
