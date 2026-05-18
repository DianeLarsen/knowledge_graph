"use client";

import { useState } from "react";
import type { EntityType } from "@/db/schema";
import type { QuickReference, QuickNote } from "@/lib/tags/tagTypes";
import { createEntityLinkAction } from "@/app/actions/entityLinks";

type QuickLinkActionsProps = {
  entityType: EntityType;
  entityId: string;
  notes: QuickNote[];
  references: QuickReference[];
  linkedNoteIds: string[];
  linkedReferenceIds: string[];
  onLinkedNoteIdsChange?: (noteIds: string[]) => void;
  onLinkedReferenceIdsChange?: (referenceIds: string[]) => void;
};

export default function QuickLinkActions({
  entityType,
  entityId,
  notes,
  references,
  linkedNoteIds,
  linkedReferenceIds,
  onLinkedNoteIdsChange,
  onLinkedReferenceIdsChange,
}: QuickLinkActionsProps) {
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedReferenceId, setSelectedReferenceId] = useState("");

  const availableNotes = notes.filter((note) => {
    if (entityType === "note" && note.id === entityId) return false;
    return !linkedNoteIds.includes(note.id);
  });

  const linkedNotes = notes.filter((note) => linkedNoteIds.includes(note.id));

  const availableReferences = references.filter((reference) => {
    if (entityType === "reference" && reference.id === entityId) return false;
    return !linkedReferenceIds.includes(reference.id);
  });

  const linkedReferences = references.filter((reference) =>
    linkedReferenceIds.includes(reference.id),
  );

  async function handleLinkNote(formData: FormData) {
    await createEntityLinkAction(formData);

    if (!selectedNoteId) return;

    const next = linkedNoteIds.includes(selectedNoteId)
      ? linkedNoteIds
      : [...linkedNoteIds, selectedNoteId];

    onLinkedNoteIdsChange?.(next);
    setSelectedNoteId("");
  }

  async function handleLinkReference(formData: FormData) {
    await createEntityLinkAction(formData);

    if (!selectedReferenceId) return;

    const next = linkedReferenceIds.includes(selectedReferenceId)
      ? linkedReferenceIds
      : [...linkedReferenceIds, selectedReferenceId];

    onLinkedReferenceIdsChange?.(next);
    setSelectedReferenceId("");
  }
const selectClass =
  "w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[rgb(var(--text))] shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:bg-slate-950 dark:focus:ring-purple-900";

const linkButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600";

const linkedItemClass =
  "rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200";

const groupLabelClass =
  "mb-1 text-xs font-bold uppercase tracking-wide text-[rgb(var(--muted))]";
  return (
    <div className="space-y-3">
      {linkedNotes.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked notes</p>

          <div className="space-y-1">
            {linkedNotes.map((note) => (
              <p key={note.id} className={linkedItemClass}>
                {note.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {linkedReferences.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked references</p>

          <div className="space-y-1">
            {linkedReferences.map((reference) => (
              <p key={reference.id} className={linkedItemClass}>
                {reference.title}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {availableNotes.length > 0 && (
          <form action={handleLinkNote} className="space-y-2">
            <input type="hidden" name="sourceType" value={entityType} />
            <input type="hidden" name="sourceId" value={entityId} />
            <input type="hidden" name="targetType" value="note" />

            <select
              name="targetId"
              required
              value={selectedNoteId}
              onChange={(event) => setSelectedNoteId(event.target.value)}
              className={selectClass}
            >
              <option value="" disabled>
                Choose note...
              </option>

              {availableNotes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title}
                </option>
              ))}
            </select>

            <select
              name="relationshipType"
              defaultValue="related"
              className={selectClass}
            >
              <option value="related">Related</option>
              <option value="supports">Supports</option>
              <option value="references">References</option>
              <option value="follow_up">Follow up</option>
              <option value="depends_on">Depends on</option>
              <option value="extends">Extends</option>
            </select>

            <button className={linkButtonClass}>Link note</button>
          </form>
        )}

        {availableReferences.length > 0 && (
          <form action={handleLinkReference} className="space-y-2">
            <input type="hidden" name="sourceType" value={entityType} />
            <input type="hidden" name="sourceId" value={entityId} />
            <input type="hidden" name="targetType" value="reference" />

            <select
              name="targetId"
              required
              value={selectedReferenceId}
              onChange={(event) => setSelectedReferenceId(event.target.value)}
              className={selectClass}
            >
              <option value="" disabled>
                Choose reference...
              </option>

              {availableReferences.map((reference) => (
                <option key={reference.id} value={reference.id}>
                  {reference.title}
                </option>
              ))}
            </select>

            <select
              name="relationshipType"
              defaultValue="references"
              className={selectClass}
            >
              <option value="references">References</option>
              <option value="uses">Uses</option>
              <option value="supports">Supports</option>
              <option value="related">Related</option>
            </select>

            <button className={linkButtonClass}>Link reference</button>
          </form>
        )}

        {availableNotes.length === 0 && availableReferences.length === 0 && (
          <p className="text-xs text-[rgb(var(--muted))]">
            Everything available is already linked.
          </p>
        )}
      </div>
    </div>
  );
}
