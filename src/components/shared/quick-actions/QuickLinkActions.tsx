"use client";

import { useState } from "react";
import type { EntityType } from "@/db/schema";
import type {
  QuickReference,
  QuickNote,
  QuickTask,
  QuickEvent,
} from "@/lib/types/quickTypes";
import { createEntityLinkAction } from "@/app/actions/entityLinks";

type LinkTargetType = "note" | "reference" | "task" | "event";

type QuickLinkActionsProps = {
  entityType: EntityType;
  entityId: string;
  notes: QuickNote[];
  references: QuickReference[];
  linkedNoteIds: string[];
  linkedReferenceIds: string[];
  tasks: QuickTask[];
  events: QuickEvent[];
  linkedTaskIds: string[];
  linkedEventIds: string[];
  onLinkedTaskIdsChange?: (taskIds: string[]) => void;
  onLinkedEventIdsChange?: (eventIds: string[]) => void;
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
  tasks = [],
  events = [],
  linkedTaskIds = [],
  linkedEventIds = [],
  onLinkedTaskIdsChange,
  onLinkedEventIdsChange,
  onLinkedNoteIdsChange,
  onLinkedReferenceIdsChange,
}: QuickLinkActionsProps) {
  const [activePicker, setActivePicker] = useState<LinkTargetType | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [relationshipType, setRelationshipType] = useState("related");

  const availableTasks = tasks.filter((task) => {
    if (entityType === "task" && task.id === entityId) return false;
    return !linkedTaskIds.includes(task.id);
  });

  const linkedTasks = tasks.filter((task) => linkedTaskIds.includes(task.id));

  const availableEvents = events.filter((event) => {
    if (entityType === "event" && event.id === entityId) return false;
    return !linkedEventIds.includes(event.id);
  });

  const linkedEvents = events.filter((event) =>
    linkedEventIds.includes(event.id),
  );

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

  const pickerConfig = {
    note: {
      title: "Link note",
      label: "Choose note...",
      items: availableNotes,
      defaultRelationship: "related",
      relationships: [
        "related",
        "supports",
        "references",
        "follow_up",
        "depends_on",
        "extends",
      ],
    },
    reference: {
      title: "Link reference",
      label: "Choose reference...",
      items: availableReferences,
      defaultRelationship: "references",
      relationships: ["references", "uses", "supports", "related"],
    },
    task: {
      title: "Link task",
      label: "Choose task...",
      items: availableTasks,
      defaultRelationship: "related",
      relationships: [
        "related",
        "supports",
        "blocks",
        "follow_up",
        "depends_on",
      ],
    },
    event: {
      title: "Link event",
      label: "Choose event...",
      items: availableEvents,
      defaultRelationship: "related",
      relationships: ["related", "supports", "follow_up", "depends_on"],
    },
  } satisfies Record<
    LinkTargetType,
    {
      title: string;
      label: string;
      items: { id: string; title: string }[];
      defaultRelationship: string;
      relationships: string[];
    }
  >;

  function openPicker(type: LinkTargetType) {
    setActivePicker(type);
    setSelectedTargetId("");
    setRelationshipType(pickerConfig[type].defaultRelationship);
  }

  async function handleLinkTarget(formData: FormData) {
    await createEntityLinkAction(formData);

    if (!activePicker || !selectedTargetId) return;

    if (activePicker === "note") {
      onLinkedNoteIdsChange?.(
        linkedNoteIds.includes(selectedTargetId)
          ? linkedNoteIds
          : [...linkedNoteIds, selectedTargetId],
      );
    }

    if (activePicker === "reference") {
      onLinkedReferenceIdsChange?.(
        linkedReferenceIds.includes(selectedTargetId)
          ? linkedReferenceIds
          : [...linkedReferenceIds, selectedTargetId],
      );
    }

    if (activePicker === "task") {
      onLinkedTaskIdsChange?.(
        linkedTaskIds.includes(selectedTargetId)
          ? linkedTaskIds
          : [...linkedTaskIds, selectedTargetId],
      );
    }

    if (activePicker === "event") {
      onLinkedEventIdsChange?.(
        linkedEventIds.includes(selectedTargetId)
          ? linkedEventIds
          : [...linkedEventIds, selectedTargetId],
      );
    }

    setActivePicker(null);
    setSelectedTargetId("");
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

      {linkedTasks.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked tasks</p>

          <div className="space-y-1">
            {linkedTasks.map((task) => (
              <p key={task.id} className={linkedItemClass}>
                {task.title}
              </p>
            ))}
          </div>
        </div>
      )}

      {linkedEvents.length > 0 && (
        <div className="mb-3">
          <p className={groupLabelClass}>Linked events</p>

          <div className="space-y-1">
            {linkedEvents.map((event) => (
              <p key={event.id} className={linkedItemClass}>
                {event.title}
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
        <div className="grid gap-2 grid-cols-4 md:grid-cols-2">
          {availableNotes.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("note")}
              className={linkButtonClass}
            >
              Link note
            </button>
          )}

          {availableReferences.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("reference")}
              className={linkButtonClass}
            >
              Link reference
            </button>
          )}

          {availableTasks.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("task")}
              className={linkButtonClass}
            >
              Link task
            </button>
          )}

          {availableEvents.length > 0 && (
            <button
              type="button"
              onClick={() => openPicker("event")}
              className={linkButtonClass}
            >
              Link event
            </button>
          )}
        </div>

        {availableNotes.length === 0 &&
          availableReferences.length === 0 &&
          availableTasks.length === 0 &&
          availableEvents.length === 0 && (
            <p className="text-xs text-[rgb(var(--muted))]">
              Everything available is already linked.
            </p>
          )}
      </div>
      {activePicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="relative z-[10000] w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[rgb(var(--text))]">
                  {pickerConfig[activePicker].title}
                </h3>
                <p className="text-xs text-[rgb(var(--muted))]">
                  Choose an item and relationship.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="rounded-lg px-2 py-1 text-md font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                ×
              </button>
            </div>

            <form action={handleLinkTarget} className="space-y-3">
              <input type="hidden" name="sourceType" value={entityType} />
              <input type="hidden" name="sourceId" value={entityId} />
              <input type="hidden" name="targetType" value={activePicker} />

              <select
                name="targetId"
                required
                value={selectedTargetId}
                onChange={(event) => setSelectedTargetId(event.target.value)}
                className={selectClass}
              >
                <option value="" disabled>
                  {pickerConfig[activePicker].label}
                </option>

                {pickerConfig[activePicker].items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>

              <select
                name="relationshipType"
                value={relationshipType}
                onChange={(event) => setRelationshipType(event.target.value)}
                className={selectClass}
              >
                {pickerConfig[activePicker].relationships.map(
                  (relationship) => (
                    <option key={relationship} value={relationship}>
                      {relationship.replace("_", " ")}
                    </option>
                  ),
                )}
              </select>

              <button className={linkButtonClass}>
                {pickerConfig[activePicker].title}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
